export type Perfil = {
    codPrf: number;
    nombrePrf: string;
    descripcionPrf: string;
    codEstPrf: number;
    esAdmin: boolean;
};

export type PerfilDetallado = {
    codPrf: number;
    nombrePrf: string;
    descripcionPrf: string;
    esAdmin: boolean;
    codEstPrf: number;
    nombreEstPrf: string;
    numUsuarios: number;
};

// Rol propio del taller (F0-13/F1-12 ext): crear/editar nunca reciben
// esAdmin -- el backend siempre fuerza un perfil no-administrador.
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

