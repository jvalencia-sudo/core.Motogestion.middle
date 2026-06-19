/**
 * Tipos para el módulo de clientes
 */

export interface Cliente {
  documentoCli: string;
  nombreCompleto: string;
  telefonoCli: string;
  correoCli: string;
  direccionCli: string;
  totalMotos: number;
}

export interface CreateClienteRequest {
  documentoCli: string;
  nombreCli: string;
  apellido1Cli: string;
  apellido2Cli?: string;
  telefonoCli: string;
  correoCli: string;
  direccionCli?: string;
}

export interface UpdateClienteRequest {
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
