/**
 * Filtro before_send de Sentry: redacta datos sensibles antes de enviar un evento.
 *
 * Cubre dos caminos que el scrub por clave (redactar()) no alcanza porque no son
 * objetos con una clave sensible, sino texto:
 * 1. La URL real de la request (event.request.url) y la de cada breadcrumb de
 *    fetch/navegación traen el documento o la placa en el path o el query string
 *    (server actions llaman a /api/clientes/{documento}; el cliente navega a
 *    /motos/editar?placa=ABC123). Se reemplaza cada segmento que parece un valor
 *    real por "{id}" y se descarta el query string entero.
 * 2. El resto (password, documento, tokens, etc.) se redacta por clave en
 *    request/extra, sin importar dónde aparezca.
 *
 * Tipado laxo a propósito: el shape exacto del evento varía entre versiones del SDK
 * y no vale la pena acoplarse a un tipo interno que puede cambiar.
 */
const CLAVES_SENSIBLES = new Set([
  "password",
  "contrasena_usu",
  "documento_cli",
  "documento_cli_mot",
  "documento_usu",
  "telefono_cli",
  "correo_cli",
  "email",
  "authorization",
  "token",
  "cookie",
  "access_token",
  "client_secret",
]);

// Segmento de path que es un valor real, no parte fija de la URL: documentos/ids
// (4+ dígitos) o placas (6 alfanuméricos con al menos un dígito). El dígito
// obligatorio es clave: sin él, segmentos fijos de 6 letras como "editar" o
// "config" quedarían redactados por error (se comprobó con un test que fallaba).
const SEGMENTO_VALOR = /^\d{4,}$|^(?=[A-Za-z0-9]*\d)[A-Za-z0-9]{6}$/;

function limpiarUrl(url: string): string {
  try {
    const u = new URL(url);
    // Se arma el string a mano (no u.pathname = ...) porque el setter de
    // pathname percent-codea las llaves ("{id}" -> "%7Bid%7D") -- así queda
    // legible en Sentry. El query string se descarta entero (?placa=ABC123
    // también puede traer un valor real).
    const pathLimpio = u.pathname
      .split("/")
      .map((seg) => (SEGMENTO_VALOR.test(seg) ? "{id}" : seg))
      .join("/");
    return `${u.origin}${pathLimpio}`;
  } catch {
    return url;
  }
}

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

// Sentry no exporta un tipo de evento cuyo `request` acepte un índice genérico
// (RequestEventData es un shape fijo), así que acá se trabaja con `unknown` y se
// castea al acceder — es lo mismo que ya hacía redactar() con el resto del evento.
export function scrubBeforeSend<T extends { request?: unknown; extra?: unknown; breadcrumbs?: unknown }>(
  event: T,
): T {
  if (event.request) {
    const request = redactar(event.request) as Record<string, unknown>;
    if (typeof request.url === "string") {
      request.url = limpiarUrl(request.url);
    }
    delete request.query_string;
    event.request = request;
  }
  if (event.extra) {
    event.extra = redactar(event.extra);
  }
  if (Array.isArray(event.breadcrumbs)) {
    for (const crumb of event.breadcrumbs as Record<string, unknown>[]) {
      const data = crumb?.data as Record<string, unknown> | undefined;
      if (data && typeof data.url === "string") {
        data.url = limpiarUrl(data.url);
      }
    }
  }
  return event;
}
