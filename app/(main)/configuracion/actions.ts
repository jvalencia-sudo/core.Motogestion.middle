"use server";

import { appFetch } from "@/lib/fetch";
import { TallerConfig } from "@/lib/types/taller";

/**
 * Obtener la configuración de mano de obra del taller
 * GET /api/talleres/config
 */
export async function obtenerConfigTaller(): Promise<TallerConfig | null> {
  const resp = await appFetch<TallerConfig>("/api/talleres/config");
  if (resp.error || !resp.data) return null;
  return resp.data;
}

/**
 * Guardar la configuración de mano de obra del taller
 * PUT /api/talleres/config
 */
export async function guardarConfigTaller(data: TallerConfig) {
  return await appFetch<TallerConfig>("/api/talleres/config", {
    method: "PUT",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}
