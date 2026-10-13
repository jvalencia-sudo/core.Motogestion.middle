"use server";

import { appFetch } from "@/lib/fetch";
import { Plan, CheckoutResponse } from "@/lib/types/plan";

export async function obtenerPlanes(): Promise<Plan[]> {
  const resp = await appFetch<Plan[]>("/api/suscripciones/planes");
  return resp.data || [];
}

// Último recurso si el backend no responde y todavía no hay nada en caché
// (ej. justo después de un deploy nuevo) -- ver obtenerPlanesPublico. Son
// los mismos valores del seed (db/full_schema_v2_multitenant.sql); si el
// precio real cambia, el próximo fetch exitoso los reemplaza igual.
const PLANES_FALLBACK: Plan[] = [
  {
    codPlan: 1,
    nombrePlan: "Prueba",
    precioPlan: 0,
    precioAPagar: 0,
    maxUsuarios: null,
    maxMotos: null,
    features: {},
    orden: 1,
  },
  {
    codPlan: 2,
    nombrePlan: "Taller",
    precioPlan: 69000,
    precioAPagar: 49000,
    maxUsuarios: null,
    maxMotos: null,
    features: {},
    orden: 2,
  },
];

/**
 * Para la landing pública (sin sesión): a diferencia de obtenerPlanes(), que
 * usa appFetch con cache:"no-store" a propósito para el /planes autenticado,
 * acá sí conviene cachear -- es la misma data pública para cualquier
 * visitante. revalidate:300 evita golpear el backend en cada visita y, si
 * una revalidación en segundo plano falla, Next sigue sirviendo la última
 * respuesta buena en vez de romper la página. PLANES_FALLBACK solo entra en
 * juego si el fetch falla y todavía no hay NADA cacheado (primera visita
 * tras un deploy, con el backend caído en ese instante exacto) -- sin esto,
 * la sección de precios quedaría vacía en vez de mostrar algo razonable.
 */
export async function obtenerPlanesPublico(): Promise<Plan[]> {
  try {
    const resp = await fetch(
      new URL("/api/suscripciones/planes", process.env.BASE_API_URL),
      { next: { revalidate: 300 } },
    );
    if (!resp.ok) throw new Error(`planes públicos: status ${resp.status}`);
    const data = (await resp.json()) as Plan[];
    return data.length > 0 ? data : PLANES_FALLBACK;
  } catch {
    return PLANES_FALLBACK;
  }
}

export async function crearCheckout(plan: string) {
  return await appFetch<CheckoutResponse>("/api/suscripciones/checkout", {
    method: "POST",
    body: JSON.stringify({ plan }),
    headers: { "Content-Type": "application/json" },
  });
}
