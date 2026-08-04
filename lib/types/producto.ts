/**
 * Tipos para el módulo de productos del taller
 */

// Tipos para los datos que vienen del backend (camelCase)
export interface Impuesto {
  codImp: number;
  nombreImp: string;
  porcentaje: number;
}

export interface ImpuestoRequest {
  codImp: number;
  porcentaje: number;
}

// Tipo de producto: BIEN (repuesto/insumo, maneja stock), SERVICIO (mano de obra,
// sin stock) o PAQUETE (combo de precio fijo compuesto por otros productos).
export type TipoProducto = "BIEN" | "SERVICIO" | "PAQUETE";

// Componente de un paquete tal como lo devuelve el backend.
export interface ComponentePaquete {
  codProComp: number;
  nombrePro: string;
  tipoPro: TipoProducto;
  cantidadComp: number;
}

// Componente de un paquete al enviarlo al backend.
export interface ComponentePaqueteRequest {
  codProComp: number;
  cantidadComp: number;
}

export interface Producto {
  codPro: number;
  nombrePro: string;
  descripcionPro: string | null;
  tipoPro: TipoProducto;
  stockPro: number | null;
  stockProMin: number | null;
  codEstPro: number;
  precioPro: number;
  estadoProducto: string | null;
  impuestos: Impuesto[];
  componentes?: ComponentePaquete[];
}

// Tipos para enviar al backend (camelCase; el backend acepta el alias)
export interface CreateProductoRequest {
  nombrePro: string;
  descripcionPro: string;
  tipoPro: TipoProducto;
  stockPro?: number;
  stockProMin?: number;
  precioPro: number;
  impuestos?: ImpuestoRequest[];
  componentes?: ComponentePaqueteRequest[];
}

export interface UpdateProductoRequest {
  nombrePro?: string;
  descripcionPro?: string;
  tipoPro?: TipoProducto;
  stockPro?: number;
  stockProMin?: number;
  precioPro?: number;
  impuestos?: ImpuestoRequest[];
  componentes?: ComponentePaqueteRequest[];
}

export interface ProductoOperationResponse {
  message: string;
  codPro?: number;
}
