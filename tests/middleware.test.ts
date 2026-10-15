import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

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

// Por defecto la cookie "logged" ya está presente: la rama que llama al
// backend (/api/auth/login) no se ejerce y estos tests se enfocan en el
// chequeo de permisos. Pasar `logged: false` simula una sesión recién creada.
function req(
  path: string,
  permissionsCookie?: string,
  { logged = true, https = false }: { logged?: boolean; https?: boolean } = {},
) {
  const headers = new Headers();
  const partes: string[] = [];
  if (logged) partes.push("logged=true");
  if (permissionsCookie !== undefined) {
    partes.push(`permissions=${encodeURIComponent(permissionsCookie)}`);
  }
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

  // F0-12: /planes, /planes/gracias y /configuracion no tenían ninguna entrada
  // en PERMISSIONS -- el middleware no encontraba regla para esas rutas y
  // redirigía a /inicio para CUALQUIER usuario, incluyendo Admin. Eso bloqueaba
  // por completo llegar a pagar un plan (el botón "Ver planes" no llevaba a
  // ningún lado).
  it.each(["/planes", "/planes/gracias", "/configuracion"])(
    "%s es accesible con leer:productos (antes redirigía a /inicio para todos)",
    async (path) => {
      getSession.mockResolvedValue(SESSION);
      const res = await middleware(req(path, JSON.stringify(["leer:productos"])));
      expect(res.headers.get("location")).toBeNull();
    },
  );

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
});
