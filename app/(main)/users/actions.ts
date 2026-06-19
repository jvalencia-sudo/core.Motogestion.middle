"use server";

import { appFetch } from "@/lib/fetch";
import {
  User,
  UserListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  UserFilterParams,
  UserOperationResponse,
} from "@/lib/types/auth/user";
import { permanentRedirect } from "next/navigation";

/**
 * Construye los query params para filtrar usuarios
 */
function buildQueryParams(filters: UserFilterParams): string {
  const params = new URLSearchParams();

  if (filters.nombre) params.append("nombre", filters.nombre);
  if (filters.correo) params.append("correo", filters.correo);
  if (filters.documentoUsu) params.append("documentoUsu", filters.documentoUsu);
  if (filters.codEstUsu !== undefined)
    params.append("codEstUsu", filters.codEstUsu.toString());
  if (filters.codPrfUsu) params.append("codPrfUsu", filters.codPrfUsu.toString());
  if (filters.codRolPrfUsu)
    params.append("codRolPrfUsu", filters.codRolPrfUsu.toString());
  if (filters.codTipoUsu)
    params.append("codTipoUsu", filters.codTipoUsu.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.offset !== undefined)
    params.append("offset", filters.offset.toString());

  return params.toString();
}


/**
 * Crear un nuevo usuario
 * POST /api/admin/users
 */
export async function crearUsuario(data: CreateUserRequest) {
  const resp = await appFetch<User>("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!resp.error) {
    permanentRedirect("/users");
  }

  return resp;
}

/**
 * Obtener usuario por documento
 * GET /api/admin/users/{documento_usu}
 */
export async function obtenerUsuarioPorDocumento(
  documento: string
): Promise<User | null> {
  try {
    const response = await appFetch<User>(`/api/admin/users/${documento}`);

    if (response.error || !response.data) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return null;
  }
}

/**
 * Actualizar un usuario
 * PUT /api/admin/users/{documento_usu}
 */
export async function editarUsuario(
  documentoOriginal: string,
  data: UpdateUserRequest
) {
  const resp = await appFetch<User>(`/api/admin/users/${documentoOriginal}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!resp.error) {
    permanentRedirect("/users");
  }

  return resp;
}

/**
 * Desactivar usuario (soft delete)
 * DELETE /api/admin/users/{documento_usu}
 */
export async function desactivarUsuario(documento: string) {
  const resp = await appFetch<UserOperationResponse>(
    `/api/admin/users/${documento}`,
    {
      method: "DELETE",
    }
  );

  return resp;
}

/**
 * Activar usuario
 * POST /api/admin/users/{documento_usu}/activate
 */
export async function activarUsuario(documento: string) {
  const resp = await appFetch<UserOperationResponse>(
    `/api/admin/users/${documento}/activate`,
    {
      method: "POST",
    }
  );

  return resp;
}

/**
 * Resetear contraseña de usuario
 * POST /api/admin/users/{documento_usu}/reset-password
 */
export async function resetearContrasena(
  documento: string,
  data: ChangePasswordRequest
) {
  const resp = await appFetch<UserOperationResponse>(
    `/api/admin/users/${documento}/reset-password`,
    {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return resp;
}

/**
 * Actualizar perfil y rol de usuario
 * PUT /api/admin/users/{documento_usu}/profile
 */
export async function actualizarPerfilRol(
  documento: string,
  data: UpdateProfileRequest
) {
  const resp = await appFetch<User>(`/api/admin/users/${documento}/profile`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return resp;
}
