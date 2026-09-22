"use server";

import { appFetch } from "@/lib/fetch";
import { permanentRedirect } from "next/navigation";
import {Rol} from "@/lib/types/auth/rol";

export async function crearRol(data: Rol) {
  const resp = await appFetch("/api/rol", {
    method: "post",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json",
    },
  });
  if (!resp.error) {
    permanentRedirect("/roles");
  }
  return resp;
}

export async function editarRol(data: Rol) {
  const resp = await appFetch("/api/rol/", {
    method: "put",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json",
    },
  });
  if (!resp.error) {
    permanentRedirect("/roles");
  }
  return resp;

}
export async function obtenerRolPorId(id: string): Promise<Rol | null> {
  try {
    const response = await appFetch<Rol>(`/api/rol/${id}`);

    if (response.error || !response.data) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("Error al obtener rol:", error);
    return null;
  }
}