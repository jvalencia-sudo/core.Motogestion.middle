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

  // Usuarios y roles (F0-13: una sola pantalla con 2 pestañas, reemplaza
  // /users y /perfiles-permisos -- editar la matriz de un rol exige el mismo
  // permiso que gestionar perfiles-permisos, no uno nuevo).
  { path: "/usuarios-roles/crear$", permissions: ["crear:users"] },
  { path: "/usuarios-roles/editar$", permissions: ["actualizar:users"] },
  { path: "/usuarios-roles/resetear-contrasena$", permissions: ["actualizar:users"] },
  { path: "/usuarios-roles$", permissions: ["leer:users", "leer:perfiles-permisos"] },

  // Reclamos
  { path: "/reclamos/crear$", permissions: ["crear:reclamos"] },
  { path: "/reclamos/editar$", permissions: ["actualizar:reclamos"] },
  { path: "/reclamos/ver$", permissions: ["leer:reclamos"] },
  { path: "/reclamos$", permissions: ["leer:reclamos"] },

  // Planes: ver el estado de la suscripción y pagar no está ligado a un
  // recurso propio del catálogo de permisos. El backend exige Admin para
  // POST /checkout (require_admin) -- "leer:users" es el mismo nivel que
  // /mi-taller y /suscripcion (acciones de Administración), no "leer:productos"
  // (lo tienen los 3 roles, pero un Mecánico/Recepcionista vería el botón
  // "Pagar" y el backend se lo rechazaría).
  { path: "/planes/gracias$", permissions: ["leer:users"] },
  { path: "/planes$", permissions: ["leer:users"] },

  // Mi taller (parámetros del taller, ej. mano de obra) y Suscripción (estado
  // del plan + historial de pagos): mismo nivel, ambas dentro del grupo
  // "Administrador" del menú -- el backend ya exige Admin para las acciones
  // que mutan algo (PUT /talleres/config, GET /suscripciones/pagos, ambas vía
  // require_admin), acá solo se gatea el ACCESO a la pantalla.
  { path: "/mi-taller$", permissions: ["leer:users"] },
  { path: "/suscripcion$", permissions: ["leer:users"] },
];
