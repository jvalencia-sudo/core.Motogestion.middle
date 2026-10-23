/**
 * Tipos para el módulo de clientes
 */

export type TipoDocumentoCliente = "CC" | "CE" | "NIT" | "PASAPORTE";

export interface Cliente {
  documentoCli: string;
  tipoDocumentoCli: TipoDocumentoCliente;
  nombreCompleto: string;
  telefonoCli: string;
  correoCli: string;
  direccionCli: string;
  totalMotos: number;
}

export interface CreateClienteRequest {
  documentoCli: string;
  tipoDocumentoCli?: TipoDocumentoCliente;
  nombreCli: string;
  apellido1Cli: string;
  apellido2Cli?: string;
  telefonoCli: string;
  correoCli: string;
  direccionCli?: string;
}

export interface UpdateClienteRequest {
  tipoDocumentoCli?: TipoDocumentoCliente;
  nombreCli?: string;
  apellido1Cli?: string;
  apellido2Cli?: string;
  telefonoCli?: string;
  correoCli?: string;
  direccionCli?: string;
}

export interface ClienteOperationResponse {
  message: string;
  documentoCli?: string;
}
