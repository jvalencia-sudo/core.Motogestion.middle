import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/permissions";
import { MENU, type MenuItem } from "@/lib/menu";

const getSession = vi.fn();
const auth0Middleware = vi.fn();
vi.mock("@/lib/auth0", () => ({
  auth0: { getSession, middleware: auth0Middleware },
}));

const { middleware } = await import("@/middleware");

const SESSION = {
  tokenSet: { accessToken: "tok" },
  user: { email: "usuario@taller.com", sub: "auth0|1" },
};

// Por defecto la cookie "logged" ya está presente, CON el "sub" de SESSION
// (mismo usuario): la rama que llama al backend (/api/auth/login) no se
// ejerce y estos tests se enfocan en el chequeo de permisos. Pasar
// `logged: false` simula una sesión recién creada; pasar un `sub` explícito
// (sin `logged: false`) simula cookies de OTRA cuenta en el mismo navegador.
function req(
  path: string,
  permissionsCookie?: string,
  {
    logged = true,
    https = false,
    superadmin = false,
    sub,
  }: { logged?: boolean; https?: boolean; superadmin?: boolean; sub?: string } = {},
) {
  const headers = new Headers();
  const partes: string[] = [];
  if (logged) partes.push("logged=true");
  if (permissionsCookie !== undefined) {
    partes.push(`permissions=${encodeURIComponent(permissionsCookie)}`);
  }
  if (superadmin) partes.push("superadmin=true");
  const subCookie = sub ?? (logged ? SESSION.user.sub : undefined);
  if (subCookie !== undefined) partes.push(`sub=${encodeURIComponent(subCookie)}`);
  if (partes.length) headers.set("cookie", partes.join("; "));
  const base = https ? "https://taller.app" : "http://localhost:3000";
  return new NextRequest(new URL(path, base), { headers });
}

describe("middleware", () => {
  beforeEach(() => {
    getSession.mockReset();
    auth0Middleware.mockReset();
  });

  it("login recién hecho: la MISMA petición ya ve los permisos nuevos, sin necesitar un segundo request", async () => {
    getSession.mockResolvedValue(SESSION);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        permissions: ["crear:productos"],
        nombreTal: "Taller X",
        perfil: "Administrador",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("BASE_API_URL", "http://backend.local");

    try {
      const res = await middleware(req("/productos/crear", undefined, { logged: false }));

      // No debe redirigir a /inicio: el permiso recién llegado del backend ya
      // se usa para ESTE mismo request, no el de una cookie vieja/ausente.
      expect(res.headers.get("location")).toBeNull();
      // Y debe quedar guardado para el navegador, para las próximas peticiones.
      expect(res.cookies.get("logged")?.value).toBe("true");
      expect(res.cookies.get("permissions")?.value).toBe(
        JSON.stringify(["crear:productos"]),
      );
      expect(res.cookies.get("taller")?.value).toBe("Taller X");
      expect(res.cookies.get("perfil")?.value).toBe("Administrador");
    } finally {
      vi.unstubAllGlobals();
      vi.unstubAllEnvs();
    }
  });

  it("en HTTP (local) las cookies NO van marcadas Secure; en HTTPS sí", async () => {
    getSession.mockResolvedValue(SESSION);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ permissions: ["leer:marcas"] }),
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("BASE_API_URL", "http://backend.local");

    try {
      const resHttp = await middleware(req("/inicio", undefined, { logged: false }));
      expect(resHttp.cookies.get("permissions")?.secure).toBeFalsy();

      const resHttps = await middleware(
        req("/inicio", undefined, { logged: false, https: true }),
      );
      expect(resHttps.cookies.get("permissions")?.secure).toBe(true);
    } finally {
      vi.unstubAllGlobals();
      vi.unstubAllEnvs();
    }
  });

  it("/auth/logout borra las cookies propias de la app además de la sesión de Auth0", async () => {
    const sdkResponse = NextResponse.redirect("http://localhost:3000/");
    sdkResponse.cookies.set("logged", "true");
    sdkResponse.cookies.set("permissions", JSON.stringify(["leer:marcas"]));
    sdkResponse.cookies.set("taller", "Taller Anterior");
    sdkResponse.cookies.set("perfil", "Mecánico");
    auth0Middleware.mockResolvedValue(sdkResponse);

    const res = await middleware(req("/auth/logout"));

    for (const name of ["logged", "permissions", "taller", "perfil"]) {
      const cookie = res.cookies.get(name);
      expect(cookie?.value).toBe("");
    }
  });

  it("otras rutas /auth/ (ej. login) no tocan las cookies de la app", async () => {
    const sdkResponse = NextResponse.redirect("http://localhost:3000/auth/callback");
    auth0Middleware.mockResolvedValue(sdkResponse);

    const res = await middleware(req("/auth/login"));

    expect(res).toBe(sdkResponse);
    expect(res.cookies.get("logged")).toBeUndefined();
  });

  it("ruta pública sin sesión pasa sin redirigir (y sin siquiera consultar la sesión)", async () => {
    getSession.mockRejectedValue(new Error("no debería llamarse"));
    const res = await middleware(req("/"));
    expect(res.headers.get("location")).toBeNull();
  });

  it("sin sesión en ruta protegida redirige a /auth/login con returnTo", async () => {
    getSession.mockResolvedValue(null);
    const res = await middleware(req("/marcas"));
    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/auth/login");
    expect(location.searchParams.get("returnTo")).toBe("/marcas");
  });

  it("ruta sin el permiso requerido redirige a /inicio (307, no cacheable por el navegador)", async () => {
    getSession.mockResolvedValue(SESSION);
    const res = await middleware(req("/marcas", JSON.stringify(["leer:clientes"])));
    // 307 a propósito, no 308: un 308 es "Permanent Redirect" y los navegadores
    // lo cachean indefinidamente por URL incluso sin Cache-Control -- un
    // usuario al que luego SÍ se le otorga el permiso seguiría viendo la
    // redirección vieja servida desde el caché del navegador, sin tocar
    // siquiera el servidor, hasta que vacíe el caché a mano.
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/inicio");
  });

  it("ruta con el permiso correcto pasa (no redirige)", async () => {
    getSession.mockResolvedValue(SESSION);
    const res = await middleware(req("/marcas", JSON.stringify(["leer:marcas"])));
    expect(res.headers.get("location")).toBeNull();
  });

  it("cookie permissions con JSON corrupto redirige a /inicio en vez de crashear", async () => {
    getSession.mockResolvedValue(SESSION);
    const res = await middleware(req("/marcas", "esto-no-es-json{{{"));
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/inicio");
  });

  it("/inicio no exige permiso específico (basta con sesión válida)", async () => {
    getSession.mockResolvedValue(SESSION);
    const res = await middleware(req("/inicio"));
    expect(res.headers.get("location")).toBeNull();
  });

  // F0-12: /planes y /planes/gracias no tenían ninguna entrada en PERMISSIONS
  // -- el middleware no encontraba regla para esas rutas y redirigía a
  // /inicio para CUALQUIER usuario, incluyendo Admin. Eso bloqueaba por
  // completo llegar a pagar un plan (el botón "Ver planes" no llevaba a
  // ningún lado).
  //
  // F0-13 (cierre): el permiso pasó de "leer:productos" (lo tienen los 3
  // roles) a "leer:users" -- mismo nivel que /mi-taller y /suscripcion. El
  // backend siempre exigió Admin para POST /checkout (require_admin); con
  // "leer:productos" un Mecánico/Recepcionista veía el botón "Pagar" y el
  // backend se lo rechazaba.
  it.each(["/planes", "/planes/gracias"])(
    "%s es accesible con leer:users",
    async (path) => {
      getSession.mockResolvedValue(SESSION);
      const res = await middleware(req(path, JSON.stringify(["leer:users"])));
      expect(res.headers.get("location")).toBeNull();
    },
  );

  it.each(["/planes", "/planes/gracias"])(
    "%s redirige a /inicio sin leer:users",
    async (path) => {
      getSession.mockResolvedValue(SESSION);
      const res = await middleware(req(path, JSON.stringify(["leer:productos"])));
      expect(res.status).toBe(307);
      expect(new URL(res.headers.get("location")!).pathname).toBe("/inicio");
    },
  );

  // F0-13 (ext): "Configuración" vuelve al menú como "Mi taller", dentro del
  // grupo Administrador -- mismo permiso que sus hermanos (Usuarios y roles,
  // Suscripción), ya no "leer:productos" (el backend siempre exigió Admin
  // para esta pantalla vía require_admin, el middleware ahora lo refleja).
  it("/mi-taller es accesible con leer:users", async () => {
    getSession.mockResolvedValue(SESSION);
    const res = await middleware(req("/mi-taller", JSON.stringify(["leer:users"])));
    expect(res.headers.get("location")).toBeNull();
  });

  it("/mi-taller redirige a /inicio sin leer:users", async () => {
    getSession.mockResolvedValue(SESSION);
    const res = await middleware(req("/mi-taller", JSON.stringify(["leer:productos"])));
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/inicio");
  });

  it("/suscripcion es accesible con leer:users", async () => {
    getSession.mockResolvedValue(SESSION);
    const res = await middleware(req("/suscripcion", JSON.stringify(["leer:users"])));
    expect(res.headers.get("location")).toBeNull();
  });

  it("/suscripcion redirige a /inicio sin leer:users", async () => {
    getSession.mockResolvedValue(SESSION);
    const res = await middleware(req("/suscripcion", JSON.stringify(["leer:productos"])));
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/inicio");
  });

  // F0-13: Usuarios, Roles y Vistas (ya quitadas en F0-11) y Perfiles y
  // Permisos se consolidaron en una sola pantalla.
  it("/usuarios-roles es accesible con leer:users", async () => {
    getSession.mockResolvedValue(SESSION);
    const res = await middleware(req("/usuarios-roles", JSON.stringify(["leer:users"])));
    expect(res.headers.get("location")).toBeNull();
  });

  it("/usuarios-roles redirige a /inicio sin leer:users ni leer:perfiles-permisos", async () => {
    getSession.mockResolvedValue(SESSION);
    const res = await middleware(req("/usuarios-roles", JSON.stringify(["leer:productos"])));
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/inicio");
  });

  // F0-14: /superadmin es una sección aislada, todo-o-nada -- no usa PERMISSIONS
  // (esa tabla es "accion:recurso" por taller; esto es una marca de plataforma).
  it("/superadmin sin la cookie superadmin redirige a /inicio", async () => {
    getSession.mockResolvedValue(SESSION);
    const res = await middleware(req("/superadmin", JSON.stringify(["leer:users"])));
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/inicio");
  });

  it("/superadmin con la cookie superadmin pasa (sin importar los permisos de taller)", async () => {
    getSession.mockResolvedValue(SESSION);
    const res = await middleware(req("/superadmin", undefined, { superadmin: true }));
    expect(res.headers.get("location")).toBeNull();
  });

  it("/superadmin/talleres con la cookie superadmin también pasa", async () => {
    getSession.mockResolvedValue(SESSION);
    const res = await middleware(req("/superadmin/talleres", undefined, { superadmin: true }));
    expect(res.headers.get("location")).toBeNull();
  });

  it("/inicio con la cookie superadmin redirige a /superadmin", async () => {
    getSession.mockResolvedValue(SESSION);
    const res = await middleware(req("/inicio", undefined, { superadmin: true }));
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/superadmin");
  });

  it("login recién hecho: esSuperAdmin en la respuesta deja la cookie superadmin lista para ESTE mismo request", async () => {
    getSession.mockResolvedValue(SESSION);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ permissions: [], esSuperAdmin: true }),
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("BASE_API_URL", "http://backend.local");

    try {
      const res = await middleware(req("/inicio", undefined, { logged: false }));
      expect(res.cookies.get("superadmin")?.value).toBe("true");
      // Y ya redirige a /superadmin en esa misma petición, sin esperar la próxima.
      expect(res.status).toBe(307);
      expect(new URL(res.headers.get("location")!).pathname).toBe("/superadmin");
    } finally {
      vi.unstubAllGlobals();
      vi.unstubAllEnvs();
    }
  });

  // BLOQUEANTE 2 (seguridad): las cookies propias de la app no estaban atadas
  // al sub de la sesión de Auth0 -- si la cuenta cambiaba sin pasar por
  // /auth/logout, la cuenta nueva heredaba las cookies (incluida
  // "superadmin") de la anterior en el mismo navegador.
  describe("cookies de otra cuenta en el mismo navegador", () => {
    it("sesión de B con cookies de A (superadmin) no entra a /superadmin", async () => {
      // Cookies en el navegador: cuenta A, superadmin. Pero la sesión de
      // Auth0 ahora es de B (sub distinto) -- nunca pasó por /auth/logout.
      getSession.mockResolvedValue({
        tokenSet: { accessToken: "tok-b" },
        user: { email: "b@taller.com", sub: "auth0|B" },
      });
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ permissions: ["leer:clientes"], esSuperAdmin: false }),
      });
      vi.stubGlobal("fetch", fetchMock);
      vi.stubEnv("BASE_API_URL", "http://backend.local");

      try {
        const res = await middleware(
          req("/superadmin", undefined, { superadmin: true, sub: "auth0|A" }),
        );
        // Se volvió a pedir permisos (el backend dice que B no es superadmin):
        expect(fetchMock).toHaveBeenCalled();
        expect(res.status).toBe(307);
        expect(new URL(res.headers.get("location")!).pathname).toBe("/inicio");
        // Y la cookie superadmin vieja no sobrevive en la respuesta.
        expect(res.cookies.get("superadmin")?.value).toBeFalsy();
      } finally {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
      }
    });

    it("sesión de B con permisos/cookies de A no entra con los permisos de A", async () => {
      getSession.mockResolvedValue({
        tokenSet: { accessToken: "tok-b" },
        user: { email: "b@taller.com", sub: "auth0|B" },
      });
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ permissions: ["leer:productos"] }), // B no tiene leer:users
      });
      vi.stubGlobal("fetch", fetchMock);
      vi.stubEnv("BASE_API_URL", "http://backend.local");

      try {
        const res = await middleware(
          req("/usuarios-roles", JSON.stringify(["leer:users"]), { sub: "auth0|A" }),
        );
        expect(fetchMock).toHaveBeenCalled();
        expect(res.status).toBe(307);
        expect(new URL(res.headers.get("location")!).pathname).toBe("/inicio");
      } finally {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
      }
    });

    it("mismo sub en la cookie: no vuelve a pedir permisos (sin regresión)", async () => {
      getSession.mockResolvedValue(SESSION);
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);

      try {
        const res = await middleware(req("/inicio", undefined, { sub: SESSION.user.sub }));
        expect(fetchMock).not.toHaveBeenCalled();
        expect(res.headers.get("location")).toBeNull();
      } finally {
        vi.unstubAllGlobals();
      }
    });
  });
});

// F0-13: ya no existe la regla "sin ':' se muestra siempre" -- cada hoja del
// menú (lib/menu.ts) exige un permiso real, así que tiene que existir una
// regla en PERMISSIONS (lib/permissions.ts, lo que de verdad aplica el
// middleware) que matchee su ruta y acepte ese mismo permiso. Sin este test,
// un ítem de menú y la regla del middleware podrían desincronizarse en
// silencio: el menú lo mostraría pero el middleware igual redirigiría a
// /inicio al hacer click.
function hojasDelMenu(items: MenuItem[]): MenuItem[] {
  return items.flatMap((item) => (item.items ? hojasDelMenu(item.items) : [item]));
}

describe("el menú no muestra nada que el middleware vaya a bloquear", () => {
  it.each(hojasDelMenu(MENU).map((item) => [item.title, item.url!, item.permission!]))(
    "%s (%s) tiene una regla en PERMISSIONS que acepta %s",
    (_title, url, permission) => {
      const regla = PERMISSIONS.find((p) => new RegExp(p.path).test(url));
      expect(regla, `No hay ninguna regla de PERMISSIONS que matchee ${url}`).toBeDefined();
      expect(regla!.permissions).toContain(permission);
    },
  );
});
