/**
 * Filtro before_send de Sentry: redacta datos sensibles antes de enviar un evento.
 * Defensa adicional a lo que ya evita el propio SDK — recorre `request`/`extra` del
 * evento y redacta cualquier clave de la lista negra, sin importar dónde aparezca.
 * Tipado laxo a propósito: el shape exacto del evento varía entre versiones del SDK
 * y no vale la pena acoplarse a un tipo interno que puede cambiar.
 */
const CLAVES_SENSIBLES = new Set([
  "password",
  "contrasena_usu",
  "documento_cli",
  "documento_cli_mot",
  "authorization",
  "token",
  "cookie",
  "access_token",
  "client_secret",
]);

function redactar(valor: unknown): unknown {
  if (Array.isArray(valor)) return valor.map(redactar);
  if (valor && typeof valor === "object") {
    return Object.fromEntries(
      Object.entries(valor as Record<string, unknown>).map(([k, v]) => [
        k,
        CLAVES_SENSIBLES.has(k.toLowerCase()) ? "[REDACTADO]" : redactar(v),
      ]),
    );
  }
  return valor;
}

export function scrubBeforeSend<T extends { request?: unknown; extra?: unknown }>(
  event: T,
): T {
  if (event.request) {
    event.request = redactar(event.request);
  }
  if (event.extra) {
    event.extra = redactar(event.extra);
  }
  return event;
}
