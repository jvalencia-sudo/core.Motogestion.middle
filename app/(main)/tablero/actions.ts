"use server";

import { appFetch } from "@/lib/fetch";
import { TableroResponse } from "@/lib/types/tablero";

export async function getTablero(
  mecanico?: string,
): Promise<TableroResponse | null> {
  const q = mecanico ? `?mecanico=${encodeURIComponent(mecanico)}` : "";
  const { data } = await appFetch<TableroResponse>(`/api/tablero${q}`);
  return data;
}

export async function cambiarEstadoOrden(
  consecutivoOt: number,
  codEstado: number,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await appFetch(`/api/tablero/${consecutivoOt}/estado`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codEstado }),
  });
  return { ok: !error, error: error ?? undefined };
}
