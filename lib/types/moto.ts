/**
 * Tipos para el módulo de motos
 */

export interface Moto {
  placaMot: string;
  modeloMot: number;
  colorMot: string;
  cilindrajeMot: number;
  ciudadPlacaMot?: string | null;
  marca: string;
  propietario: string;
  telefonoCli: string;
  totalOrdenes: number;
}

export interface CreateMotoRequest {
  placaMot: string;
  modeloMot: number;
  colorMot: string;
  cilindrajeMot: number;
  documentoCliMot: string;
  codMarcaMot: number;
  ciudadPlacaMot?: string;
}

export interface UpdateMotoRequest {
  placaMot?: string;
  modeloMot?: number;
  colorMot?: string;
  cilindrajeMot?: number;
  documentoCliMot?: string;
  codMarcaMot?: number;
  ciudadPlacaMot?: string;
}

export interface MotoOperationResponse {
  message: string;
  placaMot?: string;
}
