import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Resolución robusta de la URL base. Auth0 exige https en producción y el build
// la evalúa, así que no podemos depender de que APP_BASE_URL esté perfecta en
// cada entorno (los previews de Vercel tienen URL dinámica). Orden de prioridad:
//   1) APP_BASE_URL (si la defines explícita, ej. dominio propio)
//   2) VERCEL_PROJECT_PRODUCTION_URL (dominio estable de producción en Vercel)
//   3) VERCEL_URL (URL del deployment/preview actual)
//   4) localhost (desarrollo)
// VERCEL_* vienen sin protocolo; les anteponemos https://.
const appBaseUrl =
  process.env.APP_BASE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

export const auth0 = new Auth0Client({
  appBaseUrl,
  authorizationParameters: {
    scope: process.env.AUTH0_SCOPE,
    audience: process.env.AUTH0_AUDIENCE,
  },
});
