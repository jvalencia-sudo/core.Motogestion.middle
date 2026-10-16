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
    codRolPrf: number;
    codEstPrf: number;
    nombreEstPrf: string;
    nombreRolPrf: string;
    numUsuarios: number;
};

