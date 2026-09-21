export interface Plan {
  codPlan: number;
  nombrePlan: string;
  precioPlan: number;
  maxUsuarios: number | null;
  maxMotos: number | null;
  features: Record<string, boolean>;
  orden: number;
}

export interface CheckoutResponse {
  checkoutUrl: string;
  referencia: string;
}
