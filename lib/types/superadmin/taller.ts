// Vista de PLATAFORMA de un taller (F0-14, panel de super-admin) -- distinta
// de lib/types/taller.ts, que describe el taller del usuario logueado.
export type TallerPlataforma = {
  codTaller: number;
  nombreTal: string;
  nitTal?: string | null;
  correoTal?: string | null;
  telefonoTal?: string | null;
  fechaCreacionTal?: string | null;
  estadoTal: string; // prueba | activo | suspendido
  diasRestantes?: number | null;
  precioSuscTal?: number | null;
  esFundador: boolean;
  ultimoPagoFecha?: string | null;
  ordenesUltimos7Dias: number;
  ordenesUltimos30Dias: number;
  usuariosActivos: number;
  ultimaActividad?: string | null;
};

export type UsuarioTaller = {
  nombreCompleto: string;
  rol: string;
  ultimoIngreso?: string | null;
};

export type PagoHistorial = {
  codPago: number;
  nombrePlan: string;
  monto: number;
  estado: string;
  medio: string;
  detalleMedio?: string | null;
  fecha: string;
};

export type NotaTaller = {
  id: number;
  autor: string;
  fecha: string;
  texto: string;
};

export type TallerDetalle = {
  taller: TallerPlataforma;
  pagos: PagoHistorial[];
  usuarios: UsuarioTaller[];
  notas: NotaTaller[];
};

export type CrearNotaRequest = {
  texto: string;
};

// Mismo contrato que usa el registro público de talleres (POST /api/talleres).
export type CrearTallerManualRequest = {
  nombreTal: string;
  correo: string;
  nombreDueno: string;
  nitTal?: string | null;
};

export type CrearTallerManualResponse = {
  codTaller: number;
  nombreTal: string;
  correo: string;
};
