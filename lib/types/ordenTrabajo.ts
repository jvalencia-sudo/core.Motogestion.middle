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
  // F2-02: retirar un ítem ya no lo borra -- lo marca con motivo.
  retirado: boolean;
  motivoRetiro?: string | null;
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
  // F2-02: lo ve el cliente final en el link público -- separado de observacionOt.
  diagnosticoOt?: string | null;

  // Anulación (F1-05)
  motivoAnulacionOt?: string | null;
  fechaAnulacionOt?: string | null;
  documentoUsuAnulacionOt?: string | null;

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
  // F1-07: pagado/saldo (excluye ítems no cobrados y pagos anulados)
  totalPagado?: number;
  saldoOt?: number;
  // F2-01: token del link público de estado (se puede regenerar).
  tokenPublico: string;
  // F2-03: fecha/hora de la aprobación de cotización vigente, si existe.
  aprobadoEn?: string | null;
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
  // F1-07: para el filtro "con saldo pendiente" del listado.
  saldoOt?: number;
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
  detalles: DetalleOrdenTrabajoRequest[];
}

// Request para actualizar orden
export interface UpdateOrdenTrabajoRequest {
  fechaEntregaOt?: string;
  observacionOt?: string;
  codOtEstOt?: number;
  documentoUsuRpOt?: string;
  documentoUsuMcOt?: string;
}

// Request para cambiar estado
export interface CambiarEstadoRequest {
  codOtEstOt: number;
  // F1-07: confirma entregar (estado 4) con saldo pendiente ("a crédito").
  confirmarCredito?: boolean;
}

// Request para entregar orden
export interface EntregarOrdenRequest {
  kilometrajeSalidaOt?: number;
  // F1-07: confirma entregar con saldo pendiente ("a crédito").
  confirmarCredito?: boolean;
}

// Request para actualizar cantidad de producto
export interface UpdateCantidadProductoRequest {
  cantidadDeto: number;
  cobrarDeto?: boolean;
  motivoNoCobroDeto?: string;
}

// F2-02: retirar un ítem (reemplaza el antiguo DELETE físico) y diagnóstico.
export interface RetirarProductoRequest {
  motivo: string;
}

export interface GuardarDiagnosticoRequest {
  texto: string;
}

// Response de operaciones
export interface OrdenTrabajoOperationResponse {
  message: string;
  consecutivoOt?: number;
}

// Request para anular una orden (F1-05: motivo obligatorio)
export interface AnularOrdenRequest {
  motivo: string;
}

// Un evento del historial de cambios de una orden (leído de audit_log, F1-05)
export interface HistorialEvento {
  fecha: string;
  usuario: string;
  tabla: string;
  evento: string; // "Creado" | "Editado" | "Eliminado"
  valorAnterior?: Record<string, unknown> | null;
  valorNuevo?: Record<string, unknown> | null;
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

// Para selector de usuarios (mecánicos/recepcionistas)
export interface UsuarioSelect {
  documentoUsu: string;
  nombreCompleto: string;
  esAdminUsu: boolean | undefined;
}

// Para selector de clientes en el formulario
export interface ClienteSelect {
  documentoCli: string;
  nombreCompleto: string;
  telefonoCli: string;
}

// ---- F2-01: link público de estado (sin login) ----

export interface OrdenPublicaItem {
  nombre: string;
  tipo: "BIEN" | "SERVICIO" | "PAQUETE";
  cantidad: number;
  valorUnitario: number;
  cobrado: boolean; // false = cortesía, se muestra tachada en $0
  subtotal: number;
  // F2-02: detalle opcional del producto, e ítems retirados -- no se
  // tachan en la lista, se muestran aparte con su motivo.
  detalle?: string | null;
  retirado: boolean;
  motivoRetiro?: string | null;
}

export interface OrdenPublicaTaller {
  nombreComercial: string;
  whatsapp?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  colorPrincipal: string;
  logoDataUri?: string | null;
  mostrarPieMotogestion: boolean;
  nit?: string | null;
  horario?: string | null;
}

// F2-02: un hito real (con hora) de la línea de tiempo. Ausente para pasos
// de órdenes de antes de esta migración -- el front cae al comportamiento
// anterior (sin hora, solo "Ahora" en el paso vigente) en ese caso.
export interface PasoHistorial {
  codOtEstOt: number;
  ocurridoEn: string;
}

export interface OrdenPublica {
  consecutivoOt: number;
  placaMot: string;
  ciudadPlacaMot?: string | null;
  marcaMoto: string;
  modeloMot: number;
  kilometrajeIngresoOt: number;
  mecanico?: string | null;
  estadoOt: string;
  codOtEstOt: number;
  fechaElaboracionOt: string;
  fechaEntregaOt?: string | null;
  // null = el taller apagó el detalle público (mostrarDetallePublicoTal)
  items: OrdenPublicaItem[] | null;
  totalOt: number | null;
  taller: OrdenPublicaTaller;
  // F2-02: diagnóstico del mecánico, ausente si está vacío.
  diagnostico?: string | null;
  // F2-03: aprobación de cotización, opcional por taller.
  esperandoAprobacion: boolean;
  aprobadoEn?: string | null;
  pasosHistorial: PasoHistorial[];
}

export interface AprobarCotizacionResponse {
  aprobadoEn: string;
  totalSnapshot: number;
}
