import * as Sentry from "@sentry/nextjs";
import { scrubBeforeSend } from "@/lib/sentry-scrub";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // NODE_ENV es "production" incluso en los preview deployments de Vercel (es
  // el build de Next el que corre en modo prod ahí) -- VERCEL_ENV sí distingue
  // production/preview/development de verdad.
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  beforeSend: scrubBeforeSend,
});
