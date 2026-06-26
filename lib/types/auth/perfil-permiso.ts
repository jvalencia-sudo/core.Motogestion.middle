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

export type PermisoDisponible = {
  codPrm: number;
  nombrePrm: string;
  descripcionPrm: string;
  rutaVisPrm: string;
};

export type AsignarPermisoRequest = {
  codPrf: number;
  codRol: number;
  codPrm: number;
  codEst: number;
};

export type CambiarEstadoPermisoRequest = {
  codPrf: number;
  codRol: number;
  codPrm: number;
  codEst: number;
};

export type PerfilConRol = {
  codPrf: number;
  nombrePrf: string;
  descripcionPrf: string;
  codEstPrf: number;
  codRolPrf: number;
  nombreRol?: string;
};
