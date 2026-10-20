// Plantillas para marcar la matriz de un rol de una sola vez ("empezar
// rápido"). Son sugerencias fijas en el front, no vienen de ningún perfil
// real de la BD -- el administrador las ve ya marcadas pero puede ajustar
// cualquier celda antes de guardar.
//
// PLANTILLA_MECANICO replica el subconjunto real que fn_seed_perfiles_taller
// le da al perfil Mecánico en el esquema (confirmado en
// tests/permisos_mecanico_test.py del backend); PLANTILLA_RECEPCION es la
// misma que le da al perfil Recepcionista.
export const PLANTILLA_MECANICO: string[] = [
  "ver:clientes",
  "ver:marcas",
  "ver:motos",
  "ver:productos",
  "ver:ordenes-trabajo",
  "crear_editar:ordenes-trabajo",
  "ver:tablero",
  "ver:reclamos",
  "crear_editar:reclamos",
];

export const PLANTILLA_RECEPCION: string[] = [
  "ver:clientes",
  "crear_editar:clientes",
  "ver:marcas",
  "ver:motos",
  "crear_editar:motos",
  "ver:productos",
  "ver:ordenes-trabajo",
  "crear_editar:ordenes-trabajo",
  "ver:tablero",
  "ver_todo:tablero",
  "ver:inventario",
  "ajustar:inventario",
  "ver:reclamos",
  "crear_editar:reclamos",
  "ver:pagos-orden",
  "crear_editar:pagos-orden",
];
