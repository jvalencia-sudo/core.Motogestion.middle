// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const crearCheckout = vi.fn();
vi.mock("../../app/(main)/planes/actions", () => ({ crearCheckout }));

const toast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));

// next/script no hace nada relevante en jsdom para este test (el widget real
// se mockea aparte vía window.WidgetCheckout) -- evita que intente inyectar
// un <script> de verdad contra la red.
vi.mock("next/script", () => ({ default: () => null }));

const { default: SubscribeButton } = await import("@/app/(main)/planes/subscribe-button");

const CHECKOUT_DATA = {
  publicKey: "pub_test_abc",
  currency: "COP",
  amountInCents: 4900000,
  reference: "MG-1-abc123",
  signature: "firma-de-prueba",
};

describe("SubscribeButton (Widget de Wompi, modal)", () => {
  let openMock: ReturnType<typeof vi.fn>;
  let widgetCheckoutMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    crearCheckout.mockReset();
    toast.mockReset();

    // Confirmación de pago exitoso hace window.location.href = ... (recarga
    // completa, no router.push) -- jsdom no implementa navegación real, así
    // que se mockea la propiedad para poder leer qué URL se le asignó.
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });

    openMock = vi.fn();
    // Una función flecha no es "constructable" (no tiene [[Construct]]) --
    // `new window.WidgetCheckout(...)` necesita una función normal aquí.
    widgetCheckoutMock = vi.fn().mockImplementation(function () {
      return { open: openMock };
    });
    window.WidgetCheckout = widgetCheckoutMock;
  });

  it("al hacer click, deshabilita el botón mientras carga", async () => {
    let resolveFetch: (v: unknown) => void = () => {};
    crearCheckout.mockReturnValue(new Promise((resolve) => { resolveFetch = resolve; }));

    render(<SubscribeButton plan="premium" />);
    const button = screen.getByRole("button", { name: /suscribirme/i });
    fireEvent.click(button);

    expect(button).toBeDisabled();
    resolveFetch({ data: CHECKOUT_DATA });
    await waitFor(() => expect(widgetCheckoutMock).toHaveBeenCalled());
  });

  it("con datos de checkout, abre el widget con la firma del backend (no un redirect)", async () => {
    crearCheckout.mockResolvedValue({ data: CHECKOUT_DATA });

    render(<SubscribeButton plan="premium" />);
    fireEvent.click(screen.getByRole("button", { name: /suscribirme/i }));

    await waitFor(() => expect(widgetCheckoutMock).toHaveBeenCalledWith({
      currency: "COP",
      amountInCents: 4900000,
      reference: "MG-1-abc123",
      publicKey: "pub_test_abc",
      signature: { integrity: "firma-de-prueba" },
    }));
    expect(openMock).toHaveBeenCalled();
  });

  it("pago aprobado: el callback del widget hace una recarga completa a /planes/gracias", async () => {
    crearCheckout.mockResolvedValue({ data: CHECKOUT_DATA });

    render(<SubscribeButton plan="premium" />);
    fireEvent.click(screen.getByRole("button", { name: /suscribirme/i }));

    await waitFor(() => expect(openMock).toHaveBeenCalled());
    const callback = openMock.mock.calls[0][0];
    callback({ transaction: { status: "APPROVED" } });

    // window.location.href (no router.push): el layout (banner de "prueba
    // gratis") se queda con el estado viejo en una navegación SPA entre
    // /planes y /planes/gracias -- una recarga completa lo evita.
    expect(window.location.href).toBe("/planes/gracias");
  });

  it("pago rechazado: muestra error y NO redirige", async () => {
    crearCheckout.mockResolvedValue({ data: CHECKOUT_DATA });

    render(<SubscribeButton plan="premium" />);
    fireEvent.click(screen.getByRole("button", { name: /suscribirme/i }));

    await waitFor(() => expect(openMock).toHaveBeenCalled());
    const callback = openMock.mock.calls[0][0];
    callback({ transaction: { status: "DECLINED" } });

    expect(window.location.href).toBe("");
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "El pago no se completó" }),
    );
  });

  it("el usuario cierra el modal sin pagar: no redirige ni muestra error", async () => {
    crearCheckout.mockResolvedValue({ data: CHECKOUT_DATA });

    render(<SubscribeButton plan="premium" />);
    fireEvent.click(screen.getByRole("button", { name: /suscribirme/i }));

    await waitFor(() => expect(openMock).toHaveBeenCalled());
    const callback = openMock.mock.calls[0][0];
    callback({});

    expect(window.location.href).toBe("");
    expect(toast).not.toHaveBeenCalled();
  });

  it("sin datos de checkout o con error del backend, NO abre el widget (no cobrar sin confirmar)", async () => {
    crearCheckout.mockResolvedValue({ data: null, error: "Pasarela no disponible" });

    render(<SubscribeButton plan="premium" />);
    fireEvent.click(screen.getByRole("button", { name: /suscribirme/i }));

    await waitFor(() => expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: "Pasarela no disponible" }),
    ));
    expect(widgetCheckoutMock).not.toHaveBeenCalled();
  });

  it("si el script del widget aún no cargó, avisa en vez de fallar en silencio", async () => {
    // Simula que next/script todavía no inyectó el widget.
    window.WidgetCheckout = undefined;
    crearCheckout.mockResolvedValue({ data: CHECKOUT_DATA });

    render(<SubscribeButton plan="premium" />);
    fireEvent.click(screen.getByRole("button", { name: /suscribirme/i }));

    await waitFor(() => expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "No se pudo abrir el pago" }),
    ));
  });
});
