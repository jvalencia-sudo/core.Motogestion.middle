// Agrupa el catálogo de permisos ("accion:recurso") en los módulos que el
// administrador reconoce, para la matriz de la pestaña Roles (F0-13).
//
// Solo se listan acá los recursos que tienen pantalla real hoy. El catálogo
// de 48 permisos trae además "operations"/"orders" (restos de una plantilla
// de logística que nunca se usó) y "roles"/"vistas" (catálogos que F0-11 dejó
// de solo lectura, ya no se gestionan por perfil) -- al no estar en este
// diccionario, simplemente no aparecen en la matriz. Así se cumple "la matriz
// no muestra permisos de la plantilla de logística" sin tocar el catálogo en
// la BD, y el día que F1-12 limpie el catálogo de verdad, esta matriz no
// necesita ningún cambio.
export const MODULOS: Record<string, string> = {
  clientes: "Clientes y motos",
  marcas: "Clientes y motos",
  motos: "Clientes y motos",
  "ordenes-trabajo": "Órdenes de trabajo",
  productos: "Productos e inventario",
  reclamos: "Reclamos",
  users: "Usuarios y configuración",
  "perfiles-permisos": "Usuarios y configuración",
};

// Orden fijo en el que se muestran las filas de la matriz (no alfabético).
export const ORDEN_MODULOS = [
  "Órdenes de trabajo",
  "Clientes y motos",
  "Productos e inventario",
  "Reclamos",
  "Usuarios y configuración",
];

export const COLUMNAS = [
  { accion: "leer", label: "Ver" },
  { accion: "crear_actualizar", label: "Crear y editar" },
  { accion: "eliminar", label: "Eliminar" },
] as const;

export type AccionColumna = (typeof COLUMNAS)[number]["accion"];

// "accion:recurso" -> { modulo, columna } | null si el recurso no está mapeado.
export function ubicarEnMatriz(
  nombrePrm: string,
): { modulo: string; columna: AccionColumna } | null {
  const [accion, recurso] = nombrePrm.split(":");
  const modulo = MODULOS[recurso];
  if (!modulo) return null;
  if (accion === "leer") return { modulo, columna: "leer" };
  if (accion === "eliminar") return { modulo, columna: "eliminar" };
  if (accion === "crear" || accion === "actualizar") {
    return { modulo, columna: "crear_actualizar" };
  }
  return null;
}
