"use server";

import { appFetch } from "@/lib/fetch";
import { Pago } from "@/lib/types/pago";
import { TallerSuscripcion } from "@/lib/types/taller";

export async function obtenerSuscripcion(): Promise<TallerSuscripcion | null> {
  const resp = await appFetch<TallerSuscripcion>("/api/talleres/suscripcion");
  return resp.data ?? null;
}

export async function obtenerHistorialPagos(): Promise<Pago[]> {
  const resp = await appFetch<Pago[]>("/api/suscripciones/pagos");
  return resp.data || [];
}
