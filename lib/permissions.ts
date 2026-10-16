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

  // Planes y Configuración: ver el estado de la suscripción y pagar/configurar
  // no están ligados a un recurso propio del catálogo de permisos. El backend
  // ya exige Admin para las acciones que mutan algo (POST /checkout, PUT
  // /talleres/config vía require_admin) -- acá solo se gatea el ACCESO a la
  // pantalla, reusando "leer:productos" porque lo tienen por defecto los 3
  // roles (Admin/Mecánico/Recepcionista). Sin esta entrada, el middleware no
  // encontraba regla para estas rutas y redirigía a /inicio para cualquiera.
  { path: "/planes/gracias$", permissions: ["leer:productos"] },
  { path: "/planes$", permissions: ["leer:productos"] },
  { path: "/configuracion$", permissions: ["leer:productos"] },

  // Suscripción (estado del plan + historial de pagos): mismo nivel que el
  // resto de Administración -- el backend ya exige Admin para el historial
  // de pagos (GET /suscripciones/pagos vía require_admin).
  { path: "/suscripcion$", permissions: ["leer:users"] },
];
