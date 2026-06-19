"use server";

import { appFetch } from "@/lib/fetch";
import {
  Producto,
  CreateProductoRequest,
  UpdateProductoRequest,
  ProductoOperationResponse,
} from "@/lib/types/producto";
import { permanentRedirect } from "next/navigation";

/**
 * Crear un nuevo producto
 * POST /api/productos
 */
export async function crearProducto(data: CreateProductoRequest) {
  const resp = await appFetch<Producto>("/api/productos", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!resp.error) {
    permanentRedirect("/productos");
  }

  return resp;
}

/**
 * Obtener producto por código
 * GET /api/productos/{cod_pro}
 */
export async function obtenerProductoPorCodigo(
  codigo: number
): Promise<Producto | null> {
  try {
    const response = await appFetch<Producto>(`/api/productos/${codigo}`);

    if (response.error || !response.data) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return null;
  }
}

/**
 * Actualizar un producto
 * PUT /api/productos/{cod_pro}
 */
export async function editarProducto(
  codigoOriginal: number,
  data: UpdateProductoRequest
) {
  const resp = await appFetch<Producto>(`/api/productos/${codigoOriginal}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!resp.error) {
    permanentRedirect("/productos");
  }

  return resp;
}

/**
 * Desactivar producto (soft delete)
 * DELETE /api/productos/{cod_pro}
 */
export async function desactivarProducto(codigo: number) {
  const resp = await appFetch<ProductoOperationResponse>(
    `/api/productos/${codigo}`,
    {
      method: "DELETE",
    }
  );

  return resp;
}

/**
 * Activar producto
 * PATCH /api/productos/{cod_pro}/activar
 */
export async function activarProducto(codigo: number) {
  const resp = await appFetch<ProductoOperationResponse>(
    `/api/productos/${codigo}/activar`,
    {
      method: "PATCH",
    }
  );

  return resp;
}
