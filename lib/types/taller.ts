/**
 * Tipos de configuración del taller
 */

export type ModoManoObra = "HORAS" | "LIBRE";

// Configuración de cómo el taller cobra la mano de obra.
export interface TallerConfig {
  modoManoObra: ModoManoObra;
  tarifaHoraPred: number;
}

// Estado de suscripción del taller (banner/gating y vista de Suscripción).
export interface TallerSuscripcion {
  estado: "prueba" | "activo" | "suspendido";
  plan: string | null;
  precio: number | null;
  fechaFin: string | null;
  diasRestantes: number | null;
  vencido: boolean;
  miembroDesde: string | null;
}
