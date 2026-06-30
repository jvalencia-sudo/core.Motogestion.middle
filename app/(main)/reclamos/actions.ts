"use server";

import { appFetch } from "@/lib/fetch";
import {
  ReclamoDetalle,
  ReclamoResumen,
  ReclamoCrear,
  ReclamoActualizar,
  OrdenTrabajoPara,
  ReclamoOperationResponse,
} from "@/lib/types/reclamo";
import { permanentRedirect } from "next/navigation";

/**
 * Obtener listado de todos los reclamos
 * GET /api/reclamos
 */
export async function obtenerReclamos(): Promise<ReclamoResumen[]> {
  try {
    const response = await appFetch<ReclamoResumen[]>("/api/reclamos");

    if (response.error || !response.data) {
      return [];
    }

    return response.data;
  } catch (error) {
    console.error("Error obteniendo reclamos:", error);
    return [];
  }
}

/**
 * Obtener reclamo por ID
 * GET /api/reclamos/{cod_rec}
 */
export async function obtenerReclamoPorId(
  codRec: number
): Promise<ReclamoDetalle | null> {
  try {
    const response = await appFetch<ReclamoDetalle>(`/api/reclamos/${codRec}`);

    if (response.error || !response.data) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("Error obteniendo reclamo:", error);
    return null;
  }
}

/**
 * Obtener reclamos por orden de trabajo
 * GET /api/reclamos/orden/{consecutivo_ot}
 */
export async function obtenerReclamosPorOrden(
  consecutivoOt: number
): Promise<ReclamoResumen[]> {
  try {
    const response = await appFetch<ReclamoResumen[]>(
      `/api/reclamos/orden/${consecutivoOt}`
    );

    if (response.error || !response.data) {
      return [];
    }

    return response.data;
  } catch (error) {
    console.error("Error obteniendo reclamos por orden:", error);
    return [];
  }
}

/**
 * Obtener reclamos por cliente
 * GET /api/reclamos/cliente/{documento}
 */
export async function obtenerReclamosPorCliente(
  documento: string
): Promise<ReclamoResumen[]> {
  try {
    const response = await appFetch<ReclamoResumen[]>(
      `/api/reclamos/cliente/${documento}`
    );

    if (response.error || !response.data) {
      return [];
    }

    return response.data;
  } catch (error) {
    console.error("Error obteniendo reclamos por cliente:", error);
    return [];
  }
}

/**
 * Obtener reclamos por moto
 * GET /api/reclamos/moto/{placa}
 */
export async function obtenerReclamosPorMoto(
  placa: string
): Promise<ReclamoResumen[]> {
  try {
    const response = await appFetch<ReclamoResumen[]>(
      `/api/reclamos/moto/${placa}`
    );

    if (response.error || !response.data) {
      return [];
    }

    return response.data;
  } catch (error) {
    console.error("Error obteniendo reclamos por moto:", error);
    return [];
  }
}

/**
 * Obtener reclamos por estado de garantía
 * GET /api/reclamos/garantia/{estado}
 */
export async function obtenerReclamosPorGarantia(
  estado: string
): Promise<ReclamoResumen[]> {
  try {
    const response = await appFetch<ReclamoResumen[]>(
      `/api/reclamos/garantia/${estado}`
    );

    if (response.error || !response.data) {
      return [];
    }

    return response.data;
  } catch (error) {
    console.error("Error obteniendo reclamos por garantía:", error);
    return [];
  }
}

/**
 * Crear nuevo reclamo
 * POST /api/reclamos
 */
export async function crearReclamo(data: ReclamoCrear) {
  const resp = await appFetch<ReclamoDetalle>("/api/reclamos", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!resp.error) {
    permanentRedirect("/reclamos");
  }

  return resp;
}

/**
 * Actualizar reclamo
 * PUT /api/reclamos/{cod_rec}
 */
export async function editarReclamo(
  codRec: number,
  data: ReclamoActualizar
) {
  const resp = await appFetch<ReclamoDetalle>(`/api/reclamos/${codRec}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return resp;
}

/**
 * Eliminar reclamo
 * DELETE /api/reclamos/{cod_rec}
 */
export async function eliminarReclamo(codRec: number) {
  const resp = await appFetch<ReclamoOperationResponse>(
    `/api/reclamos/${codRec}`,
    {
      method: "DELETE",
    }
  );

  return resp;
}

/**
 * Obtener órdenes de trabajo disponibles para crear reclamos
 * GET /api/ordenes-trabajo (filtradas para completadas)
 */
export async function obtenerOrdenesDisponibles(): Promise<OrdenTrabajoPara[]> {
  try {
    const response = await appFetch<any[]>("/api/ordenes-trabajo");

    if (response.error || !response.data) {
      return [];
    }

    // Filtrar solo órdenes entregadas/completadas
    return response.data
      .filter((orden) => orden.estadoOt === "Entregada")
      .map((orden) => ({
        consecutivoOt: orden.consecutivoOt,
        placaMot: orden.placaMot,
        nombreCompletoCliente: orden.nombreCompletoCliente,
        estadoOt: orden.estadoOt,
        fechaElaboracionOt: orden.fechaElaboracionOt,
      }));
  } catch (error) {
    console.error("Error obteniendo órdenes disponibles:", error);
    return [];
  }
}
