import "server-only";

// Los permisos los entrega el backend (tabla perfiles_permisos) con el formato
// "accion:recurso" (ej. leer:clientes, crear:motos). El middleware compara la ruta
// con estas reglas y exige que el usuario tenga al menos uno de los permisos listados.
// Las rutas más específicas (crear/editar/ver) van primero.
export const PERMISSIONS = [
  // Clientes
  { path: "/clientes/crear$", permissions: ["crear:clientes"] },
  { path: "/clientes/editar$", permissions: ["actualizar:clientes"] },
  { path: "/clientes$", permissions: ["leer:clientes"] },

  // Productos
  { path: "/productos/crear$", permissions: ["crear:productos"] },
  { path: "/productos/editar$", permissions: ["actualizar:productos"] },
  { path: "/productos$", permissions: ["leer:productos"] },

  // Inventario (movimientos, entradas, toma física)
  { path: "/inventario$", permissions: ["leer:productos"] },

  // Marcas
  { path: "/marcas/crear$", permissions: ["crear:marcas"] },
  { path: "/marcas/editar$", permissions: ["actualizar:marcas"] },
  { path: "/marcas$", permissions: ["leer:marcas"] },

  // Motos
  { path: "/motos/crear$", permissions: ["crear:motos"] },
  { path: "/motos/editar$", permissions: ["actualizar:motos"] },
  { path: "/motos$", permissions: ["leer:motos"] },

  // Tablero (vista del módulo Taller — gateada con permiso de órdenes de trabajo)
  { path: "/tablero$", permissions: ["leer:ordenes-trabajo"] },

  // Órdenes de trabajo
  { path: "/ordenes-trabajo/crear$", permissions: ["crear:ordenes-trabajo"] },
  { path: "/ordenes-trabajo/editar$", permissions: ["actualizar:ordenes-trabajo"] },
  { path: "/ordenes-trabajo/ver$", permissions: ["leer:ordenes-trabajo"] },
  { path: "/ordenes-trabajo$", permissions: ["leer:ordenes-trabajo"] },

  // Roles
  { path: "/roles/crear$", permissions: ["crear:roles"] },
  { path: "/roles/editar$", permissions: ["actualizar:roles"] },
  { path: "/roles$", permissions: ["leer:roles"] },

  // Vistas
  { path: "/vistas/crear$", permissions: ["crear:vistas"] },
  { path: "/vistas$", permissions: ["leer:vistas"] },

  // Usuarios
  { path: "/users/crear$", permissions: ["crear:users"] },
  { path: "/users/editar$", permissions: ["actualizar:users"] },
  { path: "/users/resetear-contrasena$", permissions: ["actualizar:users"] },
  { path: "/users$", permissions: ["leer:users"] },

  // Perfiles y Permisos (asignar permisos a perfiles)
  { path: "/perfiles-permisos/crear$", permissions: ["crear:perfiles-permisos"] },
  { path: "/perfiles-permisos/editar$", permissions: ["actualizar:perfiles-permisos"] },
  { path: "/perfiles-permisos$", permissions: ["leer:perfiles-permisos"] },

  // Reclamos
  { path: "/reclamos/crear$", permissions: ["crear:reclamos"] },
  { path: "/reclamos/editar$", permissions: ["actualizar:reclamos"] },
  { path: "/reclamos/ver$", permissions: ["leer:reclamos"] },
  { path: "/reclamos$", permissions: ["leer:reclamos"] },

  // Dominio legado en inglés (por si el menú aún enlaza)
  { path: "/operations/create$", permissions: ["crear:operations"] },
  { path: "/operations$", permissions: ["leer:operations"] },
  { path: "/orders/completed$", permissions: ["leer:orders"] },
  { path: "/orders/.+$", permissions: ["leer:orders"] },
  { path: "/orders$", permissions: ["leer:orders"] },
];
