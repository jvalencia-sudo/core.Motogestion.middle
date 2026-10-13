# core.Motogestion.middle

Frontend de MotoGestión: CRM/SaaS multi-taller para talleres de motos
(clientes, motos, órdenes de trabajo, inventario, planes de suscripción).
Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui, autenticación con
Auth0. Consume el backend de
[`core.Motogestion.api`](https://github.com/jvalencia-sudo/core.Motogestion.api).

## Requisitos

- Node 22 (ver `.nvmrc`)
- pnpm 10 (`corepack enable` lo resuelve solo por el `packageManager` del
  `package.json`)
- El backend corriendo en local (ver el README de `core.Motogestion.api`) —
  este front no tiene datos propios, todo lo lee/escribe a través de la API

## Levantar en local

```bash
pnpm install
cp .env.example .env   # completar con tus credenciales, ver abajo
pnpm dev                # http://localhost:3000
```

El middleware (`middleware.ts`) reescribe toda petición a `/api/*` hacia el
backend (`BASE_API_URL`), así que el navegador nunca le pega directo a la API.

## Variables de entorno

Están documentadas con comentarios en `.env.example`. Resumen:

| Variable | Para qué |
|---|---|
| `APP_BASE_URL` / `AUTH0_BASE_URL` | URL pública de este front. En producción debe ser `https` (Auth0 lo exige). |
| `AUTH0_DOMAIN`, `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`, `AUTH0_AUDIENCE`, `AUTH0_SCOPE` | Credenciales del tenant de Auth0 (mismo tenant que usa el backend). |
| `BASE_API_URL` | URL del backend, server-side (a donde el middleware reescribe `/api/*`). El navegador nunca le pega directo al backend. |
| `NEXT_PUBLIC_WHATSAPP_CONTACTO` | Link `wa.me/...` del botón de contacto en la landing. |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN de Sentry (monitoreo de errores). Vacío = deshabilitado, no bloquea nada. |
| `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | Solo hacen falta en el build de Vercel, para subir source maps a Sentry. |

En producción estas variables se configuran en Vercel → Project Settings →
Environment Variables, no en un `.env` del repo.

## Tests y lint

```bash
pnpm lint    # ESLint
pnpm test    # Vitest (unit/integration de middleware, lib, componentes)
pnpm build   # type-check + build de producción; falla si hay errores de TS/ESLint
```

CI (`.github/workflows/ci.yml`) corre `lint`, `test` y `build` en cada PR.

## Despliegue

Automático: Vercel está conectado al repo de GitHub y despliega cada push a
`main` a producción (y cada PR a un preview). No hay ningún paso manual — a
diferencia del backend, acá no hace falta SSH ni migraciones.

- Producción: la URL del proyecto en Vercel (ver dashboard de Vercel para el
  dominio actual).
- Las variables de entorno de producción se cargan una sola vez en Vercel
  (ver tabla arriba) y persisten entre deploys.
