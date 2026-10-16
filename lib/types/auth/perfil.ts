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

// Rol propio del taller (F0-13 ext): crear/editar nunca reciben cod_rol_prf
// -- el backend siempre fuerza un rol no-administrador.
export type CrearPerfilRequest = {
    nombrePrf: string;
    descripcionPrf: string;
    duplicarDe?: number;
};

export type ActualizarPerfilRequest = {
    codPrf: number;
    nombrePrf: string;
    descripcionPrf: string;
};

export type CrearPerfilResponse = {
    success: boolean;
    message: string;
    codPrf: number;
};

