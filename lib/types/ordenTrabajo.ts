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
  cantidadDeto: number; // Cantidad del producto. Si es negativa, indica que no se factura y se devuelve al inventario
  valorUnitarioDeto: number;
  subtotal: number;
  fechaConfirmacionDeto?: string;
  usuarioConfirmacion: string;
  estadoProducto: string;
}

// Detalle para crear/agregar producto (Request)
export interface DetalleOrdenTrabajoRequest {
  codProDeto: number;
  cantidadDeto: number; // Cantidad del producto. Si es negativa, indica que no se factura y se devuelve al inventario
  valorUnitarioDeto?: number;
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
  documentoMecanico: string;
  mecanico: string;

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
  mecanico: string;
  totalOt?: number;
  subtotalProductos?: number;
}

// Request para crear orden
export interface CreateOrdenTrabajoRequest {
  placaMotOt: string;
  kilometrajeIngresoOt: number;
  documentoUsuRpOt: string;
  documentoUsuMcOt: string;
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
  precioPro: number;
  precioConImpuesto: number;
  stockPro: number;
}

// Para selector de usuarios (mecánicos)
export interface UsuarioSelect {
  documentoUsu: string;
  nombreCompleto: string;
  codRolPrfUsu: number;
}

// Para selector de clientes en el formulario
export interface ClienteSelect {
  documentoCli: string;
  nombreCompleto: string;
  telefonoCli: string;
}
