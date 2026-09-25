import * as Sentry from "@sentry/nextjs";
import { scrubBeforeSend } from "@/lib/sentry-scrub";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend: scrubBeforeSend,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
