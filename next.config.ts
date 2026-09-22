import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Solo para el contenedor del VPS (build con NEXT_OUTPUT=standalone). Sin esa
  // variable, output queda undefined y el build normal no cambia.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
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

export default nextConfig;
