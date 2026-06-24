# Front Next.js para el VPS (contenedor self-hosted) — motogestion.miclickderecho.com.
# Multi-stage: el .env (con secretos) solo se usa en el builder; la imagen final
# (standalone) NO lo incluye — los secretos llegan en runtime vía env_file.

FROM node:20-slim AS builder
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ENV NEXT_OUTPUT=standalone
ENV NEXT_TELEMETRY_DISABLED=1
# Requiere un .env en el contexto para que el build resuelva Auth0 (https) y NEXT_PUBLIC_*.
RUN pnpm build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
