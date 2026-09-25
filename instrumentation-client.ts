import * as Sentry from "@sentry/nextjs";
import { scrubBeforeSend } from "@/lib/sentry-scrub";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // NEXT_PUBLIC_VERCEL_ENV solo existe si el proyecto tiene activado "Automatically
  // expose System Environment Variables" en Vercel (Project Settings → Environment
  // Variables) -- sin eso, cae a NODE_ENV como antes. El lado servidor (la mayoría
  // de los errores reales: server actions, rutas, render) no depende de este toggle.
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  beforeSend: scrubBeforeSend,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
