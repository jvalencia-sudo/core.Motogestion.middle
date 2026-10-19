// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";

const obtenerSuscripcion = vi.fn();
vi.mock("@/app/(main)/suscripcion/actions", () => ({ obtenerSuscripcion }));

const routerRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: routerRefresh }),
}));

const { default: ConfirmacionPago } = await import("@/app/(main)/planes/gracias/confirmacion-pago");

describe("ConfirmacionPago (polling tras volver de Wompi)", () => {
  beforeEach(() => {
    obtenerSuscripcion.mockReset();
    routerRefresh.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("mientras el webhook no llega, muestra el mensaje de 'confirmando'", async () => {
    obtenerSuscripcion.mockResolvedValue({ estado: "prueba" });

    render(<ConfirmacionPago />);

    expect(await screen.findByText(/confirmando tu pago/i)).toBeInTheDocument();
    expect(routerRefresh).not.toHaveBeenCalled();
  });

  it("en cuanto el webhook activa el plan, lo detecta y refresca el layout", async () => {
    obtenerSuscripcion.mockResolvedValue({ estado: "activo" });

    render(<ConfirmacionPago />);

    await waitFor(() => expect(routerRefresh).toHaveBeenCalled());
    expect(await screen.findByText(/tu plan ya está activo/i)).toBeInTheDocument();
  });

  it("si el webhook llega en un intento posterior (no el primero), igual lo detecta", async () => {
    vi.useFakeTimers();
    obtenerSuscripcion
      .mockResolvedValueOnce({ estado: "prueba" })
      .mockResolvedValueOnce({ estado: "prueba" })
      .mockResolvedValue({ estado: "activo" });

    render(<ConfirmacionPago />);
    await vi.waitFor(() => expect(obtenerSuscripcion).toHaveBeenCalledTimes(1));

    // Suficiente margen (varios intervalos) para llegar al 3er intento sin
    // depender de contar exactamente cuántas veces se reprograma el timer.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3 * 2000);
    });

    expect(routerRefresh).toHaveBeenCalled();
    expect(screen.getByText(/tu plan ya está activo/i)).toBeInTheDocument();
  });

  it("si el webhook nunca llega, deja de insistir y avisa que está demorado", async () => {
    vi.useFakeTimers();
    obtenerSuscripcion.mockResolvedValue({ estado: "prueba" });

    render(<ConfirmacionPago />);
    await vi.waitFor(() => expect(obtenerSuscripcion).toHaveBeenCalledTimes(1));

    // Más que suficiente para agotar los 10 intentos (9 intervalos de 2s).
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15 * 2000);
    });

    // Síncrono (no findByText): el estado ya quedó asentado tras el advance
    // anterior -- un query async aquí usaría timers reales, incompatibles
    // con los fake timers todavía activos.
    expect(screen.getByText(/tardando más de lo normal/i)).toBeInTheDocument();
    expect(routerRefresh).not.toHaveBeenCalled();
  });
});
