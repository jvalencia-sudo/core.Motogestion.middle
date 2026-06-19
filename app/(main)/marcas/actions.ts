"use server";

import { appFetch } from "@/lib/fetch";
import {
  Marca,
  CreateMarcaRequest,
  UpdateMarcaRequest,
  MarcaOperationResponse,
} from "@/lib/types/marca";
import { permanentRedirect } from "next/navigation";

/**
 * Crear una nueva marca
 * POST /api/marcas
 */
export async function crearMarca(data: CreateMarcaRequest) {
  const resp = await appFetch<Marca>("/api/marcas", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!resp.error) {
    permanentRedirect("/marcas");
  }

  return resp;
}

/**
 * Obtener marca por código
 * GET /api/marcas/{codMar}
 */
export async function obtenerMarcaPorCodigo(
  codigo: number
): Promise<Marca | null> {
  try {
    const response = await appFetch<Marca>(`/api/marcas/${codigo}`);

    if (response.error || !response.data) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("Error al obtener marca:", error);
    return null;
  }
}

/**
 * Actualizar una marca
 * PUT /api/marcas/{codMar}
 */
export async function editarMarca(
  codigoOriginal: number,
  data: UpdateMarcaRequest
) {
  const resp = await appFetch<Marca>(`/api/marcas/${codigoOriginal}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!resp.error) {
    permanentRedirect("/marcas");
  }

  return resp;
}

/**
 * Eliminar marca
 * DELETE /api/marcas/{codMar}
 */
export async function eliminarMarca(codigo: number) {
  const resp = await appFetch<MarcaOperationResponse>(
    `/api/marcas/${codigo}`,
    {
      method: "DELETE",
    }
  );

  return resp;
}
