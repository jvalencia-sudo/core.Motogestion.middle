/**
 * Mayúsculas y sin caracteres no alfanuméricos: "abc 12d", "ABC-12D" y
 * "ABC12D" deben resolver a la misma moto (espejo de
 * infrastructure/utils/placa.py en el backend).
 */
export function normalizarPlaca(placa: string): string {
  return placa.toUpperCase().replace(/[^A-Z0-9]/g, "");
}
