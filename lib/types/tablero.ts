export type TableroMecanico = {
  documentoUsu: string;
  nombre: string;
};

export type TableroItem = {
  consecutivoOt: number;
  fecha: string | null;
  placa: string | null;
  marca: string | null;
  cliente: string | null;
  servicio: string | null;
  estado: string | null;
  codEstado: number | null;
  mecanico: string | null;
  documentoMecanico: string | null;
};

export type TableroResponse = {
  esGestor: boolean;
  mecanicos: TableroMecanico[];
  items: TableroItem[];
};
