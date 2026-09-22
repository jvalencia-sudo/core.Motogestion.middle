// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const crearCheckout = vi.fn();
vi.mock("../../app/(main)/planes/actions", () => ({ crearCheckout }));

const toast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));

const { default: SubscribeButton } = await import("@/app/(main)/planes/subscribe-button");

describe("SubscribeButton (checkout de Wompi)", () => {
  beforeEach(() => {
    crearCheckout.mockReset();
    toast.mockReset();
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });
  });

  it("al hacer click, deshabilita el botón mientras carga", async () => {
    let resolveFetch: (v: unknown) => void = () => {};
    crearCheckout.mockReturnValue(new Promise((resolve) => { resolveFetch = resolve; }));

    render(<SubscribeButton plan="premium" />);
    const button = screen.getByRole("button", { name: /suscribirme/i });
    fireEvent.click(button);

    expect(button).toBeDisabled();
    resolveFetch({ data: { checkoutUrl: "https://checkout.wompi.co/x" } });
    await waitFor(() => expect(button).not.toBeDisabled());
  });

  it("con checkoutUrl, redirige a Wompi", async () => {
    crearCheckout.mockResolvedValue({ data: { checkoutUrl: "https://checkout.wompi.co/abc" } });

    render(<SubscribeButton plan="premium" />);
    fireEvent.click(screen.getByRole("button", { name: /suscribirme/i }));

    await waitFor(() => expect(window.location.href).toBe("https://checkout.wompi.co/abc"));
  });

  it("sin checkoutUrl o con error, NO redirige y muestra el error (no cobrar sin confirmar)", async () => {
    crearCheckout.mockResolvedValue({ data: null, error: "Pasarela no disponible" });

    render(<SubscribeButton plan="premium" />);
    fireEvent.click(screen.getByRole("button", { name: /suscribirme/i }));

    await waitFor(() => expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: "Pasarela no disponible" }),
    ));
    expect(window.location.href).toBe("");
  });
});
