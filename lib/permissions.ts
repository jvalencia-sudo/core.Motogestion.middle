import "server-only";

export const
    PERMISSIONS = [
  {
    path: "/clients$",
    permissions: ["ae:delete:me"],
  },
      {
        path: "/roles",
        permissions: ["rol:ver"],
      },
      {
        path: "/vistas",
        permissions: ["rol:ver"],
      },
      {
        path: "/users",
        permissions: ["rol:ver"],
      },
      {
        path: "/users/crear",
        permissions: ["rol:ver"],
      },
      {
        path: "/users/editar",
        permissions: ["rol:ver"],
      },
      {
        path: "/users/resetear-contrasena",
        permissions: ["rol:ver"],
      },
  {
    path: "/productos/crear$",
    permissions: ["Ver Productos"],
  },
  {
    path: "/productos/editar$",
    permissions: ["Ver Productos"],
  },
  {
    path: "/productos$",
    permissions: ["Ver Productos"],
  },
  {
    path: "/clientes/crear$",
    permissions: ["Ver Clientes"],
  },
  {
    path: "/clientes/editar$",
    permissions: ["Ver Clientes"],
  },
  {
    path: "/clientes$",
    permissions: ["Ver Clientes"],
  },
  {
    path: "/marcas/crear$",
    permissions: ["Acceso Denegado"],
  },
  {
    path: "/marcas/editar$",
    permissions: ["Acceso Denegado"],
  },
  {
    path: "/marcas$",
    permissions: ["Acceso Denegado"],
  },
  {
    path: "/motos/crear$",
    permissions: ["Ver Motos"],
  },
  {
    path: "/motos/editar$",
    permissions: ["Ver Motos"],
  },
  {
    path: "/motos$",
    permissions: ["Ver Motos"],
  },
  {
    path: "/ordenes-trabajo/crear$",
    permissions: ["Ver Productos"],
  },
  {
    path: "/ordenes-trabajo/editar$",
    permissions: ["Ver Productos"],
  },
  {
    path: "/ordenes-trabajo/ver$",
    permissions: ["Ver Productos"],
  },
  {
    path: "/ordenes-trabajo$",
    permissions: ["Ver Productos"],
  },
  {
    path: "/clients/create$",
    permissions: ["ae:delete:me"],
  },
  {
    path: "/clients/[0-9-a-z-A-Z]*$",
    permissions: ["ae:delete:me"],
  },
  {
    path: "/orders$",
    permissions: ["ae:delete:me"],
  },
  {
    path: "/orders/[0-9-a-z-A-Z]*$",
    permissions: ["ae:delete:me"],
  },
  {
    path: "/orders/completed$",
    permissions: ["ae:delete:me"],
  },
  {
    path: "/operations$",
    permissions: ["ae:delete:me"],
  },
  {
    path: "/operations/create$",
    permissions: ["ae:delete:me"],
  },
];
