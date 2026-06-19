"use server";

import { appFetch } from "@/lib/fetch";
import {
  Cliente,
  CreateClienteRequest,
  UpdateClienteRequest,
  ClienteOperationResponse,
} from "@/lib/types/cliente";
import { permanentRedirect } from "next/navigation";

/**
 * Crear un nuevo cliente
 * POST /api/clientes
 */
export async function crearCliente(data: CreateClienteRequest) {
  const resp = await appFetch<Cliente>("/api/clientes", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!resp.error) {
    permanentRedirect("/clientes");
  }

  return resp;
}

/**
 * Obtener cliente por documento
 * GET /api/clientes/{documentoCli}
 */
export async function obtenerClientePorDocumento(
  documento: string
): Promise<Cliente | null> {
  try {
    const response = await appFetch<Cliente>(`/api/clientes/${documento}`);

    if (response.error || !response.data) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    return null;
  }
}

/**
 * Actualizar un cliente
 * PUT /api/clientes/{documentoCli}
 */
export async function editarCliente(
  documentoOriginal: string,
  data: UpdateClienteRequest
) {
  const resp = await appFetch<Cliente>(`/api/clientes/${documentoOriginal}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!resp.error) {
    permanentRedirect("/clientes");
  }

  return resp;
}

/**
 * Eliminar cliente
 * DELETE /api/clientes/{documentoCli}
 */
export async function eliminarCliente(documento: string) {
  const resp = await appFetch<ClienteOperationResponse>(
    `/api/clientes/${documento}`,
    {
      method: "DELETE",
    }
  );

  return resp;
}
