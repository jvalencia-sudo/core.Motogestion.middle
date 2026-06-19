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

export interface Producto {
  codPro: number;
  nombrePro: string;
  descripcionPro: string | null;
  stockPro: number;
  stockProMin: number;
  codEstPro: number;
  precioPro: number;
  estadoProducto: string | null;
  impuestos: Impuesto[];
}

// Tipos para enviar al backend (snake_case como lo espera el backend)
export interface CreateProductoRequest {
  nombrePro: string;
  descripcionPro: string;
  stockPro: number;
  stockProMin: number;
  precioPro: number;
  impuestos?: ImpuestoRequest[];
}

export interface UpdateProductoRequest {
  nombrePro?: string;
  descripcionPro?: string;
  stockPro?: number;
  stockProMin?: number;
  precioPro?: number;
  impuestos?: ImpuestoRequest[];
}

export interface ProductoOperationResponse {
  message: string;
  codPro?: number;
}
