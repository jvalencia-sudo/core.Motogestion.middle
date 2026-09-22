"use server";

import { appFetch } from "@/lib/fetch";
import { Plan, CheckoutResponse } from "@/lib/types/plan";

export async function obtenerPlanes(): Promise<Plan[]> {
  const resp = await appFetch<Plan[]>("/api/suscripciones/planes");
  return resp.data || [];
}

export async function crearCheckout(plan: string) {
  return await appFetch<CheckoutResponse>("/api/suscripciones/checkout", {
    method: "POST",
    body: JSON.stringify({ plan }),
    headers: { "Content-Type": "application/json" },
  });
}
