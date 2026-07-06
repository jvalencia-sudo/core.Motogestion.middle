export type MovimientoInventario = {
  codMov: number;
  codPro: number;
  nombrePro: string | null;
  tipo: string; // ENTRADA / SALIDA / AJUSTE
  cantidad: number;
  stockAnt: number | null;
  stockNue: number | null;
  motivo: string | null;
  documentoUsu: string | null;
  fecha: string | null;
  referencia: string | null;
};

export type ProductoStock = {
  codPro: number;
  nombre: string | null;
  stock: number;
  stockMin: number | null;
};
