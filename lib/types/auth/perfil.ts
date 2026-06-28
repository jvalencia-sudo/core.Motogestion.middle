export type Perfil = {
    codPrf: number;
    nombrePrf: string;
    descripcionPrf: string;
    codEstPrf: number;
    codRolPrf: number;
};

export type PerfilDetallado = {
    codPrf: number;
    nombrePrf: string;
    descripcionPrf: string;
    nombreEstPrf: string;
    nombreRolPrf: string;
};

export type PerfilCreateRequest = {
    nombrePrf: string;
    descripcionPrf: string;
    codRolPrf: number;
    codEstPrf?: number;
};

export type PerfilUpdateRequest = {
    codPrf: number;
    nombrePrf: string;
    descripcionPrf: string;
    codRolPrf: number;
};

export type CambiarEstadoPerfilRequest = {
    codPrf: number;
    codEstPrf: number;
};