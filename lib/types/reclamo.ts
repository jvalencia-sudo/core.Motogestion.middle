/**
 * Tipos e interfaces para el módulo de Reclamos
 */

// Respuesta de listado - Resumen de Reclamos
export interface ReclamoResumen {
  codRec: number;
  descripcionRec: string;
  consecutivoOtRec: number;
  placaMot: string;
  nombreCompletoCliente: string;
  telefonoCli: string;
  estadoOt: string;
  fechaElaboracionOt: string;
  estadoGarantia: 'VIGENTE' | 'VENCIDA';
  documentoCli?: string;
}

// Respuesta de detalle - Reclamo Completo
export interface ReclamoDetalle extends ReclamoResumen {
  fechaEntregaOt?: string;
  fechaFinGarantiaOt?: string;
  kilometrajeIngresoOt: number;
  modeloMot: number;
  colorMot: string;
  cilindrajeMot: number;
  marcaMoto: string;
  motoCompleta: string;
  observacionCliOt?: string;
  observacionOt?: string;
  correoCliPython?: string;
  direccionCliPython?: string;
  correoCliUltimo?: string;
  direccionCli?: string;
  documentoRecepcionista: string;
  recepcionista: string;
  documentoMecanico: string;
  mecanico: string;
  diasGarantiaRestantes?: number;
}

// Para crear nuevo reclamo
export interface ReclamoCrear {
  descripcionRec: string; // 5-500 caracteres
  consecutivoOtRec: number;
}

// Para actualizar reclamo
export interface ReclamoActualizar {
  descripcionRec?: string;
}

// Selectores para dropdowns
export interface OrdenTrabajoPara {
  consecutivoOt: number;
  placaMot: string;
  nombreCompletoCliente: string;
  estadoOt: string;
  fechaElaboracionOt: string;
}

// Respuesta operativa
export interface ReclamoOperationResponse {
  success: boolean;
  message: string;
  data?: ReclamoDetalle;
}
