/**
 * Tipos para el módulo de marcas
 */

export interface Marca {
  codMar: number;
  nombreMar: string;
  totalMotos?: number;
}

export interface MarcaDetalle {
  codMar: number;
  nombreMar: string;
  placaMot: string;
  modeloMot: number;
  colorMot: string;
  cilindrajeMot: number;
}

export interface CreateMarcaRequest {
  nombreMar: string;
}

export interface UpdateMarcaRequest {
  nombreMar?: string;
}

export interface MarcaOperationResponse {
  message: string;
  codMar?: number;
}
