/**
 * Tipos de configuración del taller
 */

export type ModoManoObra = "HORAS" | "LIBRE";

// Configuración de cómo el taller cobra la mano de obra.
export interface TallerConfig {
  modoManoObra: ModoManoObra;
  tarifaHoraPred: number;
}
