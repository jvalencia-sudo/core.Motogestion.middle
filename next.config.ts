import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  /* config options here */
  // Oculta el indicador de desarrollo de Next (la "N" abajo a la izquierda en dev).
  devIndicators: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default withSentryConfig(nextConfig, {
  // Sin SENTRY_AUTH_TOKEN (solo se carga en Vercel, no en desarrollo/CI), el
  // plugin se salta la subida de source maps con un warning, no falla el build.
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
