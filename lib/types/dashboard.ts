export type OrdenPorEstado = {
  codOtEst: number;
  nombreOtEst: string;
  cantidad: number;
};

export type ResumenDashboard = {
  totalClientes: number;
  totalMotos: number;
  totalProductos: number;
  totalOrdenes: number;
  otActivas: number;
  productosBajoStock: number;
  totalReclamos: number;
  ordenesPorEstado: OrdenPorEstado[];
};
