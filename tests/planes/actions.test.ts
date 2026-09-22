import { describe, it, expect, vi, beforeEach } from "vitest";

const appFetch = vi.fn();
vi.mock("@/lib/fetch", () => ({ appFetch }));

const { crearCheckout, obtenerPlanes } = await import("@/app/(main)/planes/actions");

describe("crearCheckout (checkout de Wompi)", () => {
  beforeEach(() => appFetch.mockReset());

  it("hace POST a /api/suscripciones/checkout con el plan en el body", async () => {
    appFetch.mockResolvedValue({ data: { checkoutUrl: "https://checkout.wompi.co/x", referencia: "r1" } });

    await crearCheckout("premium");

    expect(appFetch).toHaveBeenCalledWith(
      "/api/suscripciones/checkout",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ plan: "premium" }),
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
  });

  it("si el backend falla, propaga { data: null, error } sin lanzar excepción (es dinero real)", async () => {
    appFetch.mockResolvedValue({ data: null, error: "El plan no existe" });

    const result = await crearCheckout("plan-inexistente");

    expect(result).toEqual({ data: null, error: "El plan no existe" });
  });
});

describe("obtenerPlanes", () => {
  beforeEach(() => appFetch.mockReset());

  it("devuelve [] si el backend no trae data (no debe romper la página de planes)", async () => {
    appFetch.mockResolvedValue({ data: null });
    expect(await obtenerPlanes()).toEqual([]);
  });

  it("devuelve la lista de planes cuando el backend responde bien", async () => {
    const planes = [{ codPlan: 1, nombrePlan: "Básico", precioPlan: 0, maxUsuarios: 1, maxMotos: 10, features: {}, orden: 1 }];
    appFetch.mockResolvedValue({ data: planes });
    expect(await obtenerPlanes()).toEqual(planes);
  });
});
