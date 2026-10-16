export type PerfilPermiso = {
  codPrf: number;
  nombrePrf: string;
  nombreRol: string;
  codPrm: number;
  nombrePrm: string;
  descripcionPrm: string;
  nombreVis: string;
  rutaVis: string;
  estadoPermiso: string;
};

// PUT /api/perfil-permiso/perfil/{codPrf}/permisos (F0-13): reemplaza TODOS
// los permisos del perfil de una vez -- la lista es el estado final, no un delta.
export type ReemplazarPermisosRequest = {
  codPrmList: number[];
};
