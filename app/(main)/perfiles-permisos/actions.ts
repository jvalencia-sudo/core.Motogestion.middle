"use server";

import { appFetch } from "@/lib/fetch";
import { permanentRedirect } from "next/navigation";
import {
  Perfil,
  PerfilCreateRequest,
  PerfilUpdateRequest,
  CambiarEstadoPerfilRequest,
  PerfilDetallado,
} from "@/lib/types/auth/perfil";
import { Rol } from "@/lib/types/auth/rol";

// Obtener todos los perfiles con detalles
export async function obtenerTodosLosPerfiles() {
  return await appFetch<PerfilDetallado[]>("/api/perfil/todos");
}

// Obtener perfil por ID
export async function obtenerPerfilPorId(
  codPrf: string
): Promise<Perfil | null> {
  try {
    const response = await appFetch<Perfil>(`/api/perfil/${codPrf}`);

    if (response.error || !response.data) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return null;
  }
}

// Crear perfil
export async function crearPerfil(data: PerfilCreateRequest) {
  const resp = await appFetch("/api/perfil", {
    method: "post",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json",
    },
  });
  if (!resp.error) {
    permanentRedirect("/perfiles-permisos");
  }
  return resp;
}

// Editar perfil
export async function editarPerfil(data: PerfilUpdateRequest) {
  const resp = await appFetch("/api/perfil", {
    method: "put",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json",
    },
  });
  if (!resp.error) {
    permanentRedirect("/perfiles-permisos");
  }
  return resp;
}

// Cambiar estado del perfil
export async function cambiarEstadoPerfil(data: CambiarEstadoPerfilRequest) {
  const resp = await appFetch("/api/perfil/estado", {
    method: "put",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json",
    },
  });
  return resp;
}

// Eliminar perfil
export async function eliminarPerfil(codPrf: number) {
  const resp = await appFetch(`/api/perfil/${codPrf}`, {
    method: "delete",
  });
  return resp;
}

// Obtener todos los roles (para el selector)
export async function obtenerRoles() {
  return await appFetch<Rol[]>("/api/rol");
}
