import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const getSession = vi.fn();
const auth0Middleware = vi.fn();
vi.mock("@/lib/auth0", () => ({
  auth0: { getSession, middleware: auth0Middleware },
}));

// Con "logged" siempre presente, la rama que llama al backend (/api/auth/login)
// nunca se ejerce: estos tests se enfocan en el chequeo de permisos.
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    has: () => true,
    set: vi.fn(),
  })),
}));

const { middleware } = await import("@/middleware");

const SESSION = {
  tokenSet: { accessToken: "tok" },
  user: { email: "usuario@taller.com", sub: "auth0|1" },
};

function req(path: string, permissionsCookie?: string) {
  const headers = new Headers();
  if (permissionsCookie !== undefined) {
    headers.set("cookie", `permissions=${encodeURIComponent(permissionsCookie)}`);
  }
  return new NextRequest(new URL(path, "http://localhost:3000"), { headers });
}

describe("middleware", () => {
  beforeEach(() => {
    getSession.mockReset();
    auth0Middleware.mockReset();
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

  it("ruta sin el permiso requerido redirige 308 a /inicio", async () => {
    getSession.mockResolvedValue(SESSION);
    const res = await middleware(req("/marcas", JSON.stringify(["leer:clientes"])));
    expect(res.status).toBe(308);
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
    expect(res.status).toBe(308);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/inicio");
  });

  it("/inicio no exige permiso específico (basta con sesión válida)", async () => {
    getSession.mockResolvedValue(SESSION);
    const res = await middleware(req("/inicio"));
    expect(res.headers.get("location")).toBeNull();
  });
});
