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
  "documento_usu_mc_ot",
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
// (4+ dígitos), NIT con dígito de verificación (900123456-7), o alfanumérico tipo
// placa/pasaporte/cédula de extranjería (6-12 caracteres con al menos un dígito).
// El dígito obligatorio en el tercer caso es clave: sin él, segmentos fijos de
// 6-12 letras como "editar" o "config" quedarían redactados por error (se
// comprobó con un test que fallaba). Ningún segmento fijo real de las rutas del
// front tiene dígitos, así que ampliar el rango no crea falsos positivos nuevos.
const SEGMENTO_VALOR = /^\d{4,}$|^\d+-\d+$|^(?=[A-Za-z0-9]*\d)[A-Za-z0-9]{6,12}$/;

function limpiarPath(path: string): string {
  return path
    .split("/")
    .map((seg) => (SEGMENTO_VALOR.test(seg) ? "{id}" : seg))
    .join("/");
}

function limpiarUrl(url: string): string {
  // Los breadcrumbs de fetch traen una URL absoluta, pero los de navegación del
  // router ("from"/"to") traen solo el path relativo (p.ej. "/motos/editar?placa=
  // ABC123") -- new URL(url) sin base falla ahí, así que se reintenta con una base
  // dummy y se descarta esa base al armar el resultado.
  try {
    const u = new URL(url);
    // Se arma el string a mano (no u.pathname = ...) porque el setter de
    // pathname percent-codea las llaves ("{id}" -> "%7Bid%7D") -- así queda
    // legible en Sentry. El query string se descarta entero (?placa=ABC123
    // también puede traer un valor real).
    return `${u.origin}${limpiarPath(u.pathname)}`;
  } catch {
    // no era una URL absoluta
  }
  try {
    const u = new URL(url, "https://x");
    return limpiarPath(u.pathname);
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

function limpiarBreadcrumbs(breadcrumbs: unknown): void {
  if (!Array.isArray(breadcrumbs)) return;
  for (const crumb of breadcrumbs as Record<string, unknown>[]) {
    const data = crumb?.data as Record<string, unknown> | undefined;
    if (!data) continue;
    // Los breadcrumbs de fetch/xhr usan "url"; los de navegación del router
    // ("navigation") usan "from"/"to" -- sin esto, /motos/editar?placa=ABC123
    // pasaba intacto en un breadcrumb de navegación.
    for (const campo of ["url", "from", "to"] as const) {
      if (typeof data[campo] === "string") {
        data[campo] = limpiarUrl(data[campo] as string);
      }
    }
  }
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
  limpiarBreadcrumbs(event.breadcrumbs);
  return event;
}
