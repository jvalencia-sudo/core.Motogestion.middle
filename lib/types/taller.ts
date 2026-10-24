/**
 * Tipos de configuración del taller
 */

export type ModoManoObra = "HORAS" | "LIBRE";

// Lo que el taller puede editar desde "Mi taller": mano de obra + datos del
// comprobante + personalización de la orden (F1-09). Es justo lo que viaja
// en el PUT -- nombre/NIT/correo son estructurales (ver TallerConfig) y
// nunca se mandan por acá.
export interface TallerConfigEditable {
  modoManoObra: ModoManoObra;
  tarifaHoraPred: number;
  telefonoTal: string | null;
  direccionTal: string | null;
  textoPieComprobante: string | null;
  // F1-09: personalización visual de la orden (carta + tirilla).
  nombreComercialTal: string | null;
  whatsappTal: string | null;
  colorPrincipalTal: string;
  textoCondicionesTal: string | null;
  textoPieTal: string | null;
  mostrarPreciosUnitariosTal: boolean;
  mostrarMecanicoTal: boolean;
  mostrarFirmaClienteTal: boolean;
  // F2-01: ¿se muestran ítems y total en el link público de estado?
  mostrarDetallePublicoTal: boolean;
  // F2-02: horario de atención, texto libre, visible en el link público.
  horarioAtencionTal: string | null;
  // F2-03: exigir aprobación del cliente antes de reparar (opcional, default
  // apagado -- ningún taller pierde su flujo actual sin pedirlo).
  exigirAprobacionCotizacionTal: boolean;
}

// Respuesta de GET/PUT /talleres/config: lo editable más nombre/NIT/correo de
// solo lectura (correo es la llave anti-abuso del trial -- cambiarlo requiere
// soporte) y si ya tiene logo guardado (el logo se sube aparte, ver
// subirLogoTaller en actions.ts).
export interface TallerConfig extends TallerConfigEditable {
  nombreTal: string;
  nitTal: string | null;
  correoTal: string | null;
  tieneLogo: boolean;
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
