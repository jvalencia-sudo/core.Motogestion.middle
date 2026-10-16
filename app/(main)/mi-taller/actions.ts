"use server";

import { appFetch } from "@/lib/fetch";
import { TallerConfig, TallerConfigEditable } from "@/lib/types/taller";

/**
 * Obtener la configuración del taller (mano de obra + comprobante)
 * GET /api/talleres/config
 */
export async function obtenerConfigTaller(): Promise<TallerConfig | null> {
  const resp = await appFetch<TallerConfig>("/api/talleres/config");
  if (resp.error || !resp.data) return null;
  return resp.data;
}

/**
 * Guardar la configuración del taller. Solo los campos editables -- nombre/
 * NIT/correo son de solo lectura, nunca viajan en el body.
 * PUT /api/talleres/config
 */
export async function guardarConfigTaller(data: TallerConfigEditable) {
  return await appFetch<TallerConfig>("/api/talleres/config", {
    method: "PUT",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}
