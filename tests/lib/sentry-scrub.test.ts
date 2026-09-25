import { describe, it, expect } from "vitest";
import { scrubBeforeSend } from "@/lib/sentry-scrub";

describe("scrubBeforeSend", () => {
  it("redacta claves sensibles en request.data y deja el resto intacto", () => {
    const event = {
      request: { data: { password: "1234", email: "a@b.com", otro: "valor" } },
    };

    const resultado = scrubBeforeSend(event);

    const data = resultado.request!.data as Record<string, unknown>;
    expect(data.password).toBe("[REDACTADO]");
    expect(data.email).toBe("[REDACTADO]");
    expect(data.otro).toBe("valor");
  });

  it("limpia el documento del path de request.url", () => {
    const event = {
      request: { url: "https://front.example.com/api/clientes/1122334455?x=1" },
    };

    const resultado = scrubBeforeSend(event);

    const url = resultado.request!.url as string;
    expect(url).not.toContain("1122334455");
    expect(url).toBe("https://front.example.com/api/clientes/{id}");
  });

  it("limpia la placa del query string (?placa=...)", () => {
    const event = {
      request: { url: "https://front.example.com/motos/editar?placa=ABC123" },
    };

    const resultado = scrubBeforeSend(event);

    const url = resultado.request!.url as string;
    expect(url).not.toContain("ABC123");
    expect(url).toBe("https://front.example.com/motos/editar");
  });

  it("no confunde un segmento fijo de 6 letras (sin dígitos) con una placa", () => {
    const event = {
      request: { url: "https://front.example.com/talleres/config" },
    };

    const resultado = scrubBeforeSend(event);

    expect(resultado.request!.url).toBe("https://front.example.com/talleres/config");
  });

  it("limpia la url de un breadcrumb de fetch/navegación", () => {
    const event = {
      breadcrumbs: [
        { category: "fetch", data: { url: "https://front.example.com/api/clientes/1122334455" } },
      ],
    };

    const resultado = scrubBeforeSend(event);

    const url = (resultado.breadcrumbs![0] as { data: { url: string } }).data.url;
    expect(url).not.toContain("1122334455");
  });

  it("no falla con un evento vacío", () => {
    expect(scrubBeforeSend({})).toEqual({});
  });
});
