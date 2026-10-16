// Pagos de TODOS los talleres (F0-14) -- distinto de lib/types/pago.ts, que
// es el historial del taller del usuario logueado.
export type PagoPlataforma = {
  codPago: number;
  codTaller: number;
  nombreTal: string;
  nombrePlan: string;
  monto: number;
  estado: string;
  medio: string; // WOMPI | MANUAL
  detalleMedio?: string | null;
  fecha: string;
};

export type AlertaPago = {
  codPago: number;
  codTaller: number;
  nombreTal: string;
  monto: number;
  fecha: string;
};

export type AlertasPago = {
  aprobadosSinSuscripcionActiva: AlertaPago[];
  pendientesViejos: AlertaPago[];
};
