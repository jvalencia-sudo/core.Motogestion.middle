// Agrupa el catálogo de permisos ("accion:recurso") en los módulos que el
// administrador reconoce, para la matriz de la pestaña Roles (F0-13/F1-12).
//
// F1-12 limpió el catálogo de verdad en el backend: ya no trae "operations"/
// "orders" (plantilla de logística) ni "roles"/"vistas"/"users"/
// "perfiles-permisos" (nunca se consultaban), y cada módulo tiene 3 permisos
// (no 4): ver / crear_editar / eliminar_o_anular.
export const MODULOS: Record<string, string> = {
  clientes: "Clientes y motos",
  marcas: "Clientes y motos",
  motos: "Clientes y motos",
  "ordenes-trabajo": "Órdenes de trabajo",
  tablero: "Tablero",
  productos: "Productos",
  inventario: "Inventario",
  reclamos: "Reclamos",
  talleres: "Configuración",
  planes: "Configuración",
  impuestos: "Configuración",
};

// Orden fijo en el que se muestran las filas de la matriz (no alfabético).
export const ORDEN_MODULOS = [
  "Órdenes de trabajo",
  "Tablero",
  "Clientes y motos",
  "Productos",
  "Inventario",
  "Reclamos",
  "Configuración",
];

export const COLUMNAS = [
  { accion: "ver", label: "Ver" },
  { accion: "crear_editar", label: "Crear y editar" },
  { accion: "eliminar_o_anular", label: "Eliminar o anular" },
] as const;

export type AccionColumna = (typeof COLUMNAS)[number]["accion"];

// Permisos "acciones sensibles" (F1-05/F1-12): fuera de la grilla estándar
// ver/crear_editar/eliminar_o_anular, se muestran en una sección aparte de
// la matriz (un switch por permiso, no una celda de columna).
export const PERMISOS_SENSIBLES: { nombrePrm: string; etiqueta: string }[] = [
  { nombrePrm: "marcar_no_cobro:ordenes-trabajo", etiqueta: "Marcar ítems de una orden como \"no se cobra\"" },
  { nombrePrm: "anular:ordenes-trabajo", etiqueta: "Anular una orden de trabajo completa" },
  { nombrePrm: "ajustar:inventario", etiqueta: "Ajustar inventario (entradas y tomas físicas)" },
  { nombrePrm: "ver_costos:productos", etiqueta: "Ver costos y márgenes de productos" },
  { nombrePrm: "ver_todo:tablero", etiqueta: "Ver el tablero completo (todas las órdenes) y filtrar por mecánico" },
];

// "accion:recurso" -> { modulo, columna } | null si el recurso no está
// mapeado o si es una acción sensible (esas se manejan aparte).
export function ubicarEnMatriz(
  nombrePrm: string,
): { modulo: string; columna: AccionColumna } | null {
  const [accion, recurso] = nombrePrm.split(":");
  const modulo = MODULOS[recurso];
  if (!modulo) return null;
  if (accion !== "ver" && accion !== "crear_editar" && accion !== "eliminar_o_anular") {
    return null;
  }
  return { modulo, columna: accion };
}
