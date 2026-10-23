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
  confirmarCredito: boolean = false,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await appFetch(`/api/tablero/${consecutivoOt}/estado`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codEstado, confirmarCredito }),
  });
  return { ok: !error, error: error ?? undefined };
}

// F1-08: nota del mecánico (ej. "Necesito repuesto"). Se agrega a la
// observación interna sin reemplazarla -- el backend conserva el trabajo
// pedido original y le suma esta nota.
export async function agregarNotaMecanico(
  consecutivoOt: number,
  nota: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await appFetch(`/api/tablero/${consecutivoOt}/nota`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nota }),
  });
  return { ok: !error, error: error ?? undefined };
}
