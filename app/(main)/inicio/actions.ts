"use server";

import { appFetch } from "@/lib/fetch";
import { Moto } from "@/lib/types/moto";
import { OrdenTrabajoResumen } from "@/lib/types/ordenTrabajo";
import { normalizarPlaca } from "@/lib/utils/placa";

export interface ResultadoBusquedaPlaca {
  moto: Moto;
  historial: OrdenTrabajoResumen[];
}

/**
 * F1-02: busca una moto por placa (normalizada) y su historial de órdenes en
 * una sola llamada desde el cliente. El backend ya normaliza al buscar, pero
 * se normaliza también aquí para no depender de dos formatos distintos en
 * las dos llamadas.
 */
export async function buscarPorPlaca(
  placa: string
): Promise<ResultadoBusquedaPlaca | null> {
  const placaNormalizada = normalizarPlaca(placa);
  if (!placaNormalizada) return null;

  try {
    const motoResp = await appFetch<Moto>(`/api/motos/${placaNormalizada}`);
    if (motoResp.error || !motoResp.data) return null;

    const ordenesResp = await appFetch<OrdenTrabajoResumen[]>(
      `/api/ordenes-trabajo/moto/${placaNormalizada}`
    );

    return {
      moto: motoResp.data,
      historial: ordenesResp.data ?? [],
    };
  } catch (error) {
    console.error("Error al buscar por placa:", error);
    return null;
  }
}
