import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// appFetch arma la URL con new URL(input, APP_BASE_URL) cuando input es string.
process.env.APP_BASE_URL = "http://localhost:3000";

// next/headers: appFetch llama a cookies() para reenviar la cookie de sesión.
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ toString: () => "logged=true" })),
}));

// permanentRedirect lanza una excepción especial en Next real (así interrumpe
// la ejecución). La simulamos con un objeto que isRedirectError reconoce.
const REDIRECT_MARKER = { digest: "NEXT_REDIRECT;replace;/auth/logout;307" };
const permanentRedirect = vi.fn(() => {
  throw REDIRECT_MARKER;
});
vi.mock("next/navigation", () => ({ permanentRedirect }));
vi.mock("next/dist/client/components/redirect-error", () => ({
  isRedirectError: (err: unknown) => err === REDIRECT_MARKER,
}));

const { appFetch } = await import("@/lib/fetch");

function mockFetchOnce(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: response.ok ?? false,
      status: response.status ?? 200,
      json: response.json ?? (async () => { throw new Error("no body"); }),
    })),
  );
}

describe("appFetch", () => {
  beforeEach(() => {
    permanentRedirect.mockClear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("status 204 devuelve { data: null } sin intentar parsear body", async () => {
    mockFetchOnce({ ok: true, status: 204 });
    const result = await appFetch("/api/algo");
    expect(result).toEqual({ data: null });
  });

  it("respuesta ok con JSON devuelve { data }", async () => {
    mockFetchOnce({ ok: true, status: 200, json: async () => ({ id: 1 }) });
    const result = await appFetch("/api/algo");
    expect(result).toEqual({ data: { id: 1 } });
  });

  it("401 llama a permanentRedirect('/auth/logout') y propaga el error de redirect", async () => {
    mockFetchOnce({ ok: false, status: 401, json: async () => ({}) });
    await expect(appFetch("/api/algo")).rejects.toBe(REDIRECT_MARKER);
    expect(permanentRedirect).toHaveBeenCalledWith("/auth/logout");
  });

  it("error sin JSON no crashea: cae al mensaje default", async () => {
    mockFetchOnce({
      ok: false,
      status: 500,
      json: async () => { throw new Error("body vacío"); },
    });
    const result = await appFetch("/api/algo");
    expect(result).toEqual({ data: null, error: "Ha ocurrido un error inesperado" });
  });

  it("error con { detail } prioriza detail sobre message", async () => {
    mockFetchOnce({
      ok: false,
      status: 400,
      json: async () => ({ detail: "Datos inválidos", message: "otro mensaje" }),
    });
    const result = await appFetch("/api/algo");
    expect(result).toEqual({ data: null, error: "Datos inválidos" });
  });

  it("error con solo { message } usa message", async () => {
    mockFetchOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: "Falló la validación" }),
    });
    const result = await appFetch("/api/algo");
    expect(result).toEqual({ data: null, error: "Falló la validación" });
  });
});
