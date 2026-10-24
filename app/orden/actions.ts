"use server";

import { appFetch } from "@/lib/fetch";
import { AprobarCotizacionResponse, OrdenPublica } from "@/lib/types/ordenTrabajo";

/**
 * F2-01: estado público de una orden (sin login) a partir de su token. Usa
 * appFetch igual que el resto de la app -- sin sesión, el middleware
 * reescribe /api/* al backend sin Authorization, que es exactamente lo que
 * necesita esta ruta pública (GET /api/public/ordenes-trabajo/estado/{token}).
 * Un token inexistente o con un carácter cambiado da 404 -> null acá.
 */
export async function obtenerEstadoPublicoOrden(token: string): Promise<OrdenPublica | null> {
  try {
    const resp = await appFetch<OrdenPublica>(`/api/public/ordenes-trabajo/estado/${token}`);
    if (resp.error || !resp.data) return null;
    return resp.data;
  } catch (error) {
    console.error("Error obteniendo el estado público de la orden:", error);
    return null;
  }
}

/**
 * F2-03: aprueba la cotización vigente desde el link público. Devuelve el
 * mensaje de error (409 si la orden no aplica, 429 si se excedió el rate
 * limit) para que el cliente pueda mostrarlo.
 */
export async function aprobarCotizacionPublica(
  token: string
): Promise<{ data: AprobarCotizacionResponse | null; error?: string }> {
  try {
    const resp = await appFetch<AprobarCotizacionResponse>(
      `/api/public/ordenes-trabajo/${token}/aprobar`,
      { method: "PATCH" }
    );
    return { data: resp.data ?? null, error: resp.error };
  } catch (error) {
    console.error("Error aprobando la cotización pública:", error);
    return { data: null, error: "Ocurrió un error inesperado. Intenta de nuevo." };
  }
}
