// Un pago del historial de suscripción del taller.
export interface Pago {
  codPago: number;
  nombrePlan: string;
  monto: number;
  estado: "PENDING" | "APPROVED" | "DECLINED";
  fecha: string; // 'YYYY-MM-DD HH:MM'
}
