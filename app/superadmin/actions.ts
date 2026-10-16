"use server";

import { appFetch } from "@/lib/fetch";
import {
  AjustarPrecioRequest,
  ExtenderPruebaRequest,
  PagoManualRequest,
  SuspenderReactivarRequest,
} from "@/lib/types/superadmin/accion";
import { AlertasPago, PagoPlataforma } from "@/lib/types/superadmin/pago";
import { ResumenPlataforma } from "@/lib/types/superadmin/resumen";
import {
  CrearNotaRequest,
  CrearTallerManualRequest,
  CrearTallerManualResponse,
  NotaTaller,
  TallerDetalle,
  TallerPlataforma,
} from "@/lib/types/superadmin/taller";

export async function obtenerResumen() {
  return await appFetch<ResumenPlataforma>("/api/superadmin/resumen");
}

export async function obtenerTalleres(estado?: string) {
  const query = estado ? `?estado=${encodeURIComponent(estado)}` : "";
  return await appFetch<TallerPlataforma[]>(`/api/superadmin/talleres${query}`);
}

export async function obtenerDetalleTaller(codTaller: number) {
  return await appFetch<TallerDetalle>(`/api/superadmin/talleres/${codTaller}`);
}

export async function crearTallerManual(data: CrearTallerManualRequest) {
  return await appFetch<CrearTallerManualResponse>("/api/superadmin/talleres", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

export async function crearNota(codTaller: number, data: CrearNotaRequest) {
  return await appFetch<NotaTaller>(`/api/superadmin/talleres/${codTaller}/notas`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

export async function extenderPrueba(codTaller: number, data: ExtenderPruebaRequest) {
  return await appFetch(`/api/superadmin/talleres/${codTaller}/extender-prueba`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

export async function registrarPagoManual(codTaller: number, data: PagoManualRequest) {
  return await appFetch(`/api/superadmin/talleres/${codTaller}/pago-manual`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

export async function suspenderTaller(codTaller: number, data: SuspenderReactivarRequest) {
  return await appFetch(`/api/superadmin/talleres/${codTaller}/suspender`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

export async function reactivarTaller(codTaller: number, data: SuspenderReactivarRequest) {
  return await appFetch(`/api/superadmin/talleres/${codTaller}/reactivar`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

export async function ajustarPrecio(codTaller: number, data: AjustarPrecioRequest) {
  return await appFetch(`/api/superadmin/talleres/${codTaller}/precio`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

export async function obtenerPagos(estado?: string, medio?: string) {
  const params = new URLSearchParams();
  if (estado) params.set("estado", estado);
  if (medio) params.set("medio", medio);
  const query = params.toString() ? `?${params.toString()}` : "";
  return await appFetch<PagoPlataforma[]>(`/api/superadmin/pagos${query}`);
}

export async function obtenerAlertasPagos() {
  return await appFetch<AlertasPago>("/api/superadmin/pagos/alertas");
}
