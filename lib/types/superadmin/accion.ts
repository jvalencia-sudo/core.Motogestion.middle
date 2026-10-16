// Las 4 acciones de super-admin sobre la suscripción de un taller (F0-14):
// todas exigen "motivo" -- el backend las rechaza (422) sin él.
export type ExtenderPruebaRequest = {
  dias: number;
  motivo: string;
};

export type PagoManualRequest = {
  monto: number;
  detalleMedio: string; // "Efectivo" | "Transferencia" | "Nequi"
  nombrePlan?: string;
  motivo: string;
};

export type SuspenderReactivarRequest = {
  motivo: string;
};

export type AjustarPrecioRequest = {
  precioSuscTal: number;
  motivo: string;
};
