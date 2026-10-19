/**
 * Tipos para el módulo de Órdenes de Trabajo del taller
 * Frontend usa camelCase, backend Python usa snake_case
 * La conversión se hace en las actions
 */

// Estado de la orden de trabajo
export interface OtEstado {
  codOtEst: number;
  nombreOtEst: string;
  descripcionOtEst?: string;
}

// Detalle de productos en la orden (Response)
export interface DetalleOrdenTrabajoResponse {
  consecutivoOtDeto: number;
  codProDeto: number;
  nombrePro: string;
  descripcionPro?: string;
  cantidadDeto: number; // Siempre positiva (F1-06): el signo ya no indica cortesía
  valorUnitarioDeto: number;
  // F1-06: "no se cobra" es explícito -- ya NO se codifica como cantidad negativa.
  // Una cortesía (cobrarDeto=false) SÍ descuenta stock igual que cualquier otra línea.
  cobrarDeto: boolean;
  motivoNoCobroDeto?: string | null;
  subtotal: number;
  fechaConfirmacionDeto?: string;
  usuarioConfirmacion: string;
  estadoProducto: string;
}

// Detalle para crear/agregar producto (Request)
export interface DetalleOrdenTrabajoRequest {
  codProDeto: number;
  cantidadDeto: number; // Siempre positiva (F1-06)
  valorUnitarioDeto?: number;
  cobrarDeto?: boolean; // default true si se omite
  motivoNoCobroDeto?: string;
}

// Orden de trabajo completa (GET response)
export interface OrdenTrabajoResponse {
  consecutivoOt: number;
  fechaElaboracionOt: string;
  fechaEntregaOt?: string;
  kilometrajeIngresoOt: number;
  observacionCliOt?: string;
  observacionOt?: string;
  fechaFinGarantiaOt?: string;

  // Información de la moto
  placaMot: string;
  modeloMot: string;
  colorMot: string;
  cilindrajeMot: number;
  marcaMoto: string;

  // Información del cliente
  documentoCli: string;
  nombreCompletoCliente: string;
  telefonoCli: string;
  correoCli: string;

  // Información de usuarios
  documentoRecepcionista: string;
  recepcionista: string;
  // F1-01: una orden puede no tener mecánico asignado todavía.
  documentoMecanico: string | null;
  mecanico: string | null;

  // Estado
  estadoOt: string;
  codOtEstOt: number;

  // Detalles y totales
  detalles?: DetalleOrdenTrabajoResponse[];
  totalItems?: number;
  subtotalProductos?: number;
  totalImpuestos?: number;
  totalOt?: number;
}

// Resumen de orden para listados
export interface OrdenTrabajoResumen {
  consecutivoOt: number;
  fechaElaboracionOt: string;
  fechaEntregaOt?: string;
  placaMot: string;
  nombreCompletoCliente: string;
  telefonoCli: string;
  estadoOt: string;
  codOtEstOt: number;
  mecanico: string | null;
  // F1-02: para el historial del buscador de placa.
  kilometrajeIngresoOt: number;
  trabajos?: string | null;
  totalOt?: number;
  subtotalProductos?: number;
}

// Request para crear orden
export interface CreateOrdenTrabajoRequest {
  placaMotOt: string;
  kilometrajeIngresoOt: number;
  // F1-01: opcionales -- el backend pone el recepcionista por defecto
  // (usuario autenticado) y el mecánico se asigna después.
  documentoUsuRpOt?: string;
  documentoUsuMcOt?: string;
  observacionCliOt?: string;
  observacionOt?: string;
  fechaEntregaOt?: string;
  fechaFinGarantiaOt?: string;
  detalles: DetalleOrdenTrabajoRequest[];
}

// Request para actualizar orden
export interface UpdateOrdenTrabajoRequest {
  fechaEntregaOt?: string;
  observacionOt?: string;
  codOtEstOt?: number;
  fechaFinGarantiaOt?: string;
  documentoUsuRpOt?: string;
  documentoUsuMcOt?: string;
}

// Request para cambiar estado
export interface CambiarEstadoRequest {
  codOtEstOt: number;
}

// Request para entregar orden
export interface EntregarOrdenRequest {
  kilometrajeSalidaOt?: number;
}

// Request para actualizar cantidad de producto
export interface UpdateCantidadProductoRequest {
  cantidadDeto: number;
  cobrarDeto?: boolean;
  motivoNoCobroDeto?: string;
}

// Response de operaciones
export interface OrdenTrabajoOperationResponse {
  message: string;
  consecutivoOt?: number;
}

// Para selector de motos en el formulario
export interface MotoSelect {
  placaMot: string;
  marcaMoto: string;
  modeloMot: string;
  nombreCliente?: string;
}

// Para selector de productos en el formulario
export interface ProductoSelect {
  codPro: number;
  nombrePro: string;
  tipoPro: "BIEN" | "SERVICIO" | "PAQUETE";
  precioPro: number;
  precioConImpuesto: number;
  stockPro: number | null;
}

// Para selector de usuarios (mecánicos)
export interface UsuarioSelect {
  documentoUsu: string;
  nombreCompleto: string;
  // Un usuario del endpoint de admin puede no tener rol asignado; los filtros
  // por rol (=== 2 / !== 2) siguen siendo correctos con undefined.
  codRolPrfUsu: number | undefined;
}

// Para selector de clientes en el formulario
export interface ClienteSelect {
  documentoCli: string;
  nombreCompleto: string;
  telefonoCli: string;
}
