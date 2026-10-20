import "server-only";

// Los permisos los entrega el backend (tabla perfiles_permisos) con el formato
// "accion:recurso" (ej. ver:clientes, crear_editar:motos). El middleware compara
// la ruta con estas reglas y exige que el usuario tenga al menos uno de los
// permisos listados -- o, si la regla es `adminOnly`, que sea Administrador del
// taller (cookie "esAdmin", independiente del catálogo: F1-12 ya no tiene
// permisos "users"/"perfiles-permisos", esas pantallas siempre fueron
// admin-only en el backend vía require_admin, nunca por un permiso de catálogo).
// Las rutas más específicas (crear/editar/ver) van primero.
export const PERMISSIONS: {
  path: string;
  permissions?: string[];
  adminOnly?: boolean;
}[] = [
  // Clientes
  { path: "/clientes/crear$", permissions: ["crear_editar:clientes"] },
  { path: "/clientes/editar$", permissions: ["crear_editar:clientes"] },
  { path: "/clientes$", permissions: ["ver:clientes"] },

  // Productos
  { path: "/productos/crear$", permissions: ["crear_editar:productos"] },
  { path: "/productos/editar$", permissions: ["crear_editar:productos"] },
  { path: "/productos$", permissions: ["ver:productos"] },

  // Inventario (movimientos, entradas, toma física)
  { path: "/inventario$", permissions: ["ver:inventario"] },

  // Marcas
  { path: "/marcas/crear$", permissions: ["crear_editar:marcas"] },
  { path: "/marcas/editar$", permissions: ["crear_editar:marcas"] },
  { path: "/marcas$", permissions: ["ver:marcas"] },

  // Motos
  { path: "/motos/crear$", permissions: ["crear_editar:motos"] },
  { path: "/motos/editar$", permissions: ["crear_editar:motos"] },
  { path: "/motos$", permissions: ["ver:motos"] },

  // Tablero
  { path: "/tablero$", permissions: ["ver:tablero"] },

  // Órdenes de trabajo
  { path: "/ordenes-trabajo/crear$", permissions: ["crear_editar:ordenes-trabajo"] },
  { path: "/ordenes-trabajo/editar$", permissions: ["crear_editar:ordenes-trabajo"] },
  { path: "/ordenes-trabajo/ver$", permissions: ["ver:ordenes-trabajo"] },
  { path: "/ordenes-trabajo$", permissions: ["ver:ordenes-trabajo"] },

  // Usuarios y roles (F0-13: una sola pantalla con 2 pestañas). Gestionar
  // usuarios/perfiles/permisos siempre fue admin-only en el backend
  // (require_admin a nivel de router) -- nunca un permiso de catálogo.
  { path: "/usuarios-roles", adminOnly: true },

  // Reclamos
  { path: "/reclamos/crear$", permissions: ["crear_editar:reclamos"] },
  { path: "/reclamos/editar$", permissions: ["crear_editar:reclamos"] },
  { path: "/reclamos/ver$", permissions: ["ver:reclamos"] },
  { path: "/reclamos$", permissions: ["ver:reclamos"] },

  // Planes, Mi taller y Suscripción: el backend ya exige Admin para las
  // acciones que mutan algo (POST /checkout, PUT /talleres/config, GET
  // /suscripciones/pagos, todas vía require_admin) -- acá se gatea el
  // ACCESO a la pantalla con el mismo nivel.
  { path: "/planes", adminOnly: true },
  { path: "/mi-taller$", adminOnly: true },
  { path: "/suscripcion$", adminOnly: true },
];
