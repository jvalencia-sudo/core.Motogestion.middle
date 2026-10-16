/**
 * Tipos de configuración del taller
 */

export type ModoManoObra = "HORAS" | "LIBRE";

// Lo que el taller puede editar desde "Mi taller": mano de obra + datos del
// comprobante. Es justo lo que viaja en el PUT -- nombre/NIT/correo son
// estructurales (ver TallerConfig) y nunca se mandan por acá.
export interface TallerConfigEditable {
  modoManoObra: ModoManoObra;
  tarifaHoraPred: number;
  telefonoTal: string | null;
  direccionTal: string | null;
  textoPieComprobante: string | null;
  diasGarantiaPred: number;
}

// Respuesta de GET/PUT /talleres/config: lo editable más nombre/NIT/correo de
// solo lectura (correo es la llave anti-abuso del trial -- cambiarlo requiere
// soporte).
export interface TallerConfig extends TallerConfigEditable {
  nombreTal: string;
  nitTal: string | null;
  correoTal: string | null;
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
