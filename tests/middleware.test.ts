import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const getSession = vi.fn();
vi.mock("@/lib/auth0", () => ({
  auth0: { getSession, middleware: vi.fn() },
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
