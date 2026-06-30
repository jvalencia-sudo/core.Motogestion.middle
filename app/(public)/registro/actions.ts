"use server";

import { appFetch } from "@/lib/fetch";

export type RegistroInput = {
  nombreTal: string;
  nombreDueno: string;
  correo: string;
  nitTal?: string;
};

export type RegistroResult =
  | { ok: true }
  | { ok: false; error: string };

export async function registrarTaller(
  input: RegistroInput,
): Promise<RegistroResult> {
  const { data, error } = await appFetch("/api/talleres", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre_tal: input.nombreTal,
      nombre_dueno: input.nombreDueno,
      correo: input.correo,
      nit_tal: input.nitTal?.trim() ? input.nitTal.trim() : null,
    }),
  });

  if (error || !data) {
    return { ok: false, error: error ?? "No se pudo registrar el taller." };
  }
  return { ok: true };
}
