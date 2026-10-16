// Frase corta que explica qué puede hacer cada rol, bajo el selector del
// formulario de usuario (F0-13: "crea un usuario en menos de un minuto, sin
// ayuda" -- sin esto, el admin tiene que ir a mirar la matriz de permisos
// para saber qué implica elegir cada perfil). Por codRolPrf, no por nombre de
// perfil: cualquier perfil "hijo" de Mecánico (cod_rol_prf=2) hereda el texto.
export const DESCRIPCION_POR_ROL: Record<number, string> = {
  1: "Acceso total: puede gestionar usuarios, roles, y todo lo demás del taller.",
  2: "Puede gestionar órdenes de trabajo y reclamos, y ver clientes, motos y productos.",
  3: "Puede gestionar clientes, motos y órdenes de trabajo, y ver productos.",
};

export function descripcionDeRol(codRolPrf: number | undefined): string | null {
  if (!codRolPrf) return null;
  return DESCRIPCION_POR_ROL[codRolPrf] ?? null;
}
