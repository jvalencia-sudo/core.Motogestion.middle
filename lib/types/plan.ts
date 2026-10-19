export interface Plan {
  codPlan: number;
  nombrePlan: string;
  /** Precio de catálogo (el que se tacha cuando aplica precio fundador). */
  precioPlan: number;
  /** Lo que de verdad paga/pagaría quien consulta: ya calculado por el backend
   * (pactado si lo tiene, si no fundador mientras haya cupos, si no precioPlan). */
  precioAPagar: number;
  maxUsuarios: number | null;
  maxMotos: number | null;
  features: Record<string, boolean>;
  orden: number;
}

/** Datos para abrir el Widget de Wompi (modal embebido, sin redirect -- el
 * resultado se maneja en el callback de window.WidgetCheckout.open()). La
 * firma viene ya calculada por el backend. */
export interface CheckoutResponse {
  publicKey: string;
  currency: string;
  amountInCents: number;
  reference: string;
  signature: string;
}
