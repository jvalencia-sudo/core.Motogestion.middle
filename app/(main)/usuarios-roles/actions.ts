"use server";

import { appFetch } from "@/lib/fetch";
import { permanentRedirect } from "next/navigation";
import {
  User,
  VwUsuarioPerfil,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  UserOperationResponse,
} from "@/lib/types/auth/user";
import {
  Perfil,
  PerfilDetallado,
  CrearPerfilRequest,
  ActualizarPerfilRequest,
  CrearPerfilResponse,
} from "@/lib/types/auth/perfil";
import { Permiso } from "@/lib/types/auth/permiso";
import { PerfilPermiso, ReemplazarPermisosRequest } from "@/lib/types/auth/perfil-permiso";

// ---- Usuarios ----

export async function obtenerUsuarios() {
  return await appFetch<VwUsuarioPerfil[]>("/api/admin/users/all");
}

export async function obtenerUsuarioPorDocumento(
  documento: string
): Promise<User | null> {
  try {
    const response = await appFetch<User>(`/api/admin/users/${documento}`);
    if (response.error || !response.data) return null;
    return response.data;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return null;
  }
}

export async function obtenerPerfiles() {
  return await appFetch<Perfil[]>("/api/perfil");
}

export async function crearUsuario(data: CreateUserRequest) {
  const resp = await appFetch<User>("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
  if (!resp.error) permanentRedirect("/usuarios-roles");
  return resp;
}

export async function editarUsuario(
  documentoOriginal: string,
  data: UpdateUserRequest
) {
  const resp = await appFetch<User>(`/api/admin/users/${documentoOriginal}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
  if (!resp.error) permanentRedirect("/usuarios-roles");
  return resp;
}

export async function desactivarUsuario(documento: string) {
  return await appFetch<UserOperationResponse>(`/api/admin/users/${documento}`, {
    method: "DELETE",
  });
}

export async function activarUsuario(documento: string) {
  return await appFetch<UserOperationResponse>(
    `/api/admin/users/${documento}/activate`,
    { method: "POST" }
  );
}

export async function resetearContrasena(
  documento: string,
  data: ChangePasswordRequest
) {
  return await appFetch<UserOperationResponse>(
    `/api/admin/users/${documento}/reset-password`,
    {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    }
  );
}

// ---- Roles / matriz de permisos ----

export async function obtenerPerfilesDetallados() {
  return await appFetch<PerfilDetallado[]>("/api/perfil/todos");
}

export async function obtenerCatalogoPermisos() {
  return await appFetch<Permiso[]>("/api/permiso");
}

export async function obtenerPermisosAsignados(codPrf: number) {
  return await appFetch<PerfilPermiso[]>(`/api/perfil-permiso/perfil/${codPrf}`);
}

export async function reemplazarPermisos(
  codPrf: number,
  data: ReemplazarPermisosRequest
) {
  return await appFetch(`/api/perfil-permiso/perfil/${codPrf}/permisos`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

// ---- Roles propios del taller (crear/renombrar/eliminar, F0-13 ext) ----

export async function crearPerfil(data: CrearPerfilRequest) {
  return await appFetch<CrearPerfilResponse>("/api/perfil", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

export async function actualizarPerfil(data: ActualizarPerfilRequest) {
  return await appFetch("/api/perfil", {
    method: "PUT",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}

export async function eliminarPerfil(codPrf: number) {
  return await appFetch(`/api/perfil/${codPrf}`, { method: "DELETE" });
}
