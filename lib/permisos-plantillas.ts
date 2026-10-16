// Plantillas para marcar la matriz de un rol de una sola vez ("empezar
// rápido"). Son sugerencias fijas en el front, no vienen de ningún perfil
// real de la BD -- el administrador las ve ya marcadas pero puede ajustar
// cualquier celda antes de guardar.
//
// PLANTILLA_MECANICO replica el subconjunto real que fn_seed_perfiles_taller
// le da al rol Mecánico en el esquema (confirmado en
// tests/permisos_mecanico_test.py del backend); PLANTILLA_RECEPCION es una
// sugerencia razonable acorde a su descripción ("gestión de clientes, motos
// y órdenes de trabajo").
export const PLANTILLA_MECANICO: string[] = [
  "leer:clientes",
  "leer:marcas",
  "leer:motos",
  "leer:productos",
  "leer:ordenes-trabajo",
  "crear:ordenes-trabajo",
  "actualizar:ordenes-trabajo",
  "leer:reclamos",
  "crear:reclamos",
  "actualizar:reclamos",
];

export const PLANTILLA_RECEPCION: string[] = [
  "leer:clientes",
  "crear:clientes",
  "actualizar:clientes",
  "leer:motos",
  "crear:motos",
  "actualizar:motos",
  "leer:marcas",
  "leer:ordenes-trabajo",
  "crear:ordenes-trabajo",
  "actualizar:ordenes-trabajo",
  "leer:productos",
  "leer:reclamos",
  "crear:reclamos",
  "actualizar:reclamos",
];
