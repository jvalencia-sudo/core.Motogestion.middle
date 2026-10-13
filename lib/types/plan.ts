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

export interface CheckoutResponse {
  checkoutUrl: string;
  referencia: string;
}
