/**
 * Tipos para el módulo de administración de usuarios
 * Integración con API FastAPI - Conversión de snake_case a camelCase
 */

/**
 * Modelo principal de Usuario
 */
export type User = {
  documentoUsu: number;
  nombreUsu: string;
  apellido1Usu: string;
  apellido2Usu: string | null;
  correoUsu: string | null;
  contrasenaUsu: string | null; // Siempre "auth0_managed"
  codEstUsu: number; // 1=activo, 0=inactivo
  codTipoUsu: number; // 1=cliente, 2=admin, etc
  subIdUsu: string; // ID de Auth0
  codPrfUsu: number; // Código de perfil
  codRolPrfUsu: number; // Código de rol
};

/**
 * Respuesta del endpoint GET /api/admin/users (listado con paginación)
 */
export type UserListResponse = {
  users: User[];
  total: number;
  limit: number;
  offset: number;
  totalPages: number;
};

/**
 * Request para crear un nuevo usuario (POST /api/admin/users). Solo se pide el
 * perfil (codPrfUsu): el backend deriva el rol global de ese perfil (F0-13).
 */
export type CreateUserRequest = {
  documentoUsu: string;
  nombreUsu: string;
  apellido1Usu: string;
  apellido2Usu?: string;
  correoUsu: string;
  password: string; // Mínimo 8 caracteres
  codPrfUsu: number;
  codTipoUsu?: number; // Default 1
  codEstUsu?: number; // Default 1
};

/**
 * Request para actualizar un usuario (PUT /api/admin/users/{documento_usu})
 * Todos los campos son opcionales. Solo se pide el perfil (el rol se deriva).
 */
export type UpdateUserRequest = {
  documentoUsu?: string;
  nombreUsu?: string;
  apellido1Usu?: string;
  apellido2Usu?: string;
  correoUsu?: string;
  codPrfUsu?: number;
  codTipoUsu?: number;
  codEstUsu?: number;
};

/**
 * Request para cambiar contraseña (POST /api/admin/users/{documento_usu}/reset-password)
 */
export type ChangePasswordRequest = {
  newPassword: string; // Mínimo 8 caracteres
};

/**
 * Request para actualizar el rol (perfil) de un usuario
 * (PUT /api/admin/users/{documento_usu}/profile). El backend deriva el rol
 * global del perfil elegido.
 */
export type UpdateProfileRequest = {
  codPrfUsu: number;
};

/**
 * Parámetros de filtro para la búsqueda de usuarios
 */
export type UserFilterParams = {
  nombre?: string; // Buscar por nombre o apellido
  correo?: string; // Buscar por correo electrónico
  documentoUsu?: string; // Buscar por documento de identidad
  codEstUsu?: number; // Filtrar por estado (1=activo, 0=inactivo)
  codPrfUsu?: number; // Filtrar por código de perfil
  codRolPrfUsu?: number; // Filtrar por código de rol
  codTipoUsu?: number; // Filtrar por tipo de usuario
  limit?: number; // Límite de resultados (default=50, min=1, max=500)
  offset?: number; // Offset para paginación (default=0)
};

/**
 * Respuesta de operaciones simples (activar/desactivar)
 */
export type UserOperationResponse = {
  message: string;
};

/**
 * Vista de Usuario con información de Perfil y Rol
 * Representa la información combinada de usuario, perfil y rol desde la base de datos
 */
export type VwUsuarioPerfil = {
  documentoUsu: string;
  nombreCompleto: string;
  correoUsu: string;
  codTipoUsu: number;
  estadoUsuario: string;
  perfil: string;
  descripcionPerfil: string;
  rol: string;
  descripcionRol: string;
};
