"use server";

import { appFetch } from "@/lib/fetch";
import {
  Moto,
  CreateMotoRequest,
  UpdateMotoRequest,
  MotoOperationResponse,
} from "@/lib/types/moto";
import { permanentRedirect } from "next/navigation";

/**
 * Crear una nueva moto
 * POST /api/motos
 */
export async function crearMoto(data: CreateMotoRequest) {
  const resp = await appFetch<Moto>("/api/motos", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!resp.error) {
    permanentRedirect("/motos");
  }

  return resp;
}

/**
 * Obtener moto por placa
 * GET /api/motos/{placaMot}
 */
export async function obtenerMotoPorPlaca(
  placa: string
): Promise<Moto | null> {
  try {
    const response = await appFetch<Moto>(`/api/motos/${placa}`);

    if (response.error || !response.data) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("Error al obtener moto:", error);
    return null;
  }
}

/**
 * Actualizar una moto
 * PUT /api/motos/{placaMot}
 */
export async function editarMoto(
  placaOriginal: string,
  data: UpdateMotoRequest
) {
  const resp = await appFetch<Moto>(`/api/motos/${placaOriginal}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!resp.error) {
    permanentRedirect("/motos");
  }

  return resp;
}

/**
 * Eliminar moto
 * DELETE /api/motos/{placaMot}
 */
export async function eliminarMoto(placa: string) {
  const resp = await appFetch<MotoOperationResponse>(
    `/api/motos/${placa}`,
    {
      method: "DELETE",
    }
  );

  return resp;
}

/**
 * Obtener todos los clientes para el formulario
 * GET /api/clientes
 */
export async function obtenerClientesParaFormulario() {
  try {
    const response = await appFetch<any[]>("/api/clientes");
    if (response.error || !response.data) {
      return [];
    }
    return response.data;
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return [];
  }
}

/**
 * Obtener todas las marcas para el formulario
 * GET /api/marcas
 */
export async function obtenerMarcasParaFormulario() {
  try {
    const response = await appFetch<any[]>("/api/marcas");
    if (response.error || !response.data) {
      return [];
    }
    return response.data;
  } catch (error) {
    console.error("Error al obtener marcas:", error);
    return [];
  }
}

/**
 * Cargar clientes y marcas para el formulario
 */
export async function cargarDatosFormulario() {
  const [clientes, marcas] = await Promise.all([
    obtenerClientesParaFormulario(),
    obtenerMarcasParaFormulario(),
  ]);
  return { clientes, marcas };
}
