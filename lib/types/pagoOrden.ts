/**
 * F1-07: pagos/abonos de una orden. Distinto del módulo de suscripción
 * (planes/Wompi) -- esto es dinero que el cliente del taller paga por una
 * orden de trabajo.
 */

export type MetodoPago =
  | "EFECTIVO"
  | "TRANSFERENCIA"
  | "NEQUI"
  | "DAVIPLATA"
  | "TARJETA"
  | "OTRO";

export const METODOS_PAGO: { value: MetodoPago; label: string }[] = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "NEQUI", label: "Nequi" },
  { value: "DAVIPLATA", label: "Daviplata" },
  { value: "TARJETA", label: "Tarjeta" },
  { value: "OTRO", label: "Otro" },
];

export interface PagoOrden {
  codPagoOrden: number;
  consecutivoOtPago: number;
  valorPago: number;
  metodoPago: MetodoPago;
  fechaPago: string;
  documentoUsuPago: string;
  usuarioPago: string;
  referenciaPago?: string | null;
  anuladoPago: boolean;
  motivoAnulacionPago?: string | null;
  fechaAnulacionPago?: string | null;
  documentoUsuAnulacionPago?: string | null;
}

export interface RegistrarPagoRequest {
  valorPago: number;
  metodoPago: MetodoPago;
  referenciaPago?: string;
}

export interface AnularPagoRequest {
  motivo: string;
}
