# ایمیج پروداکشن فرانت کارویتا (Next ۱۶ + pnpm).
# NEXT_PUBLIC_* موقع `pnpm build` داخل باندل می‌رود.
# اگر Darkube فقط env زمان اجرا بدهد، `BACKEND_INTERNAL_URL` را روی پاد بگذارید؛
# مرورگر از `/api/nest` می‌رود (و `/__nest-api` به همان rewrite می‌شود).
# اگر Darkube فقط NEXT_PUBLIC_API_URL را موقع run بدهد، entrypoint آن را
# به BACKEND_INTERNAL_URL کپی می‌کند.
#
# نمونه:
#   docker build -t karvita-frontend \
#     --build-arg NEXT_PUBLIC_API_URL=https://api.example.com/api \
#     --build-arg NEXT_PUBLIC_SITE_URL=https://karvita.ir \
#     .
#   docker run --rm -p 3000:3000 \
#     -e BACKEND_INTERNAL_URL=https://api.example.com/api \
#     karvita-frontend

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@11 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_MODE=real
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_S3_URL
ARG NEXT_PUBLIC_AUTH_COOKIE_NAME
ARG NEXT_PUBLIC_APP_SURFACE
ARG BACKEND_INTERNAL_URL

ENV NEXT_PUBLIC_API_MODE=$NEXT_PUBLIC_API_MODE
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_S3_URL=$NEXT_PUBLIC_S3_URL
ENV NEXT_PUBLIC_AUTH_COOKIE_NAME=$NEXT_PUBLIC_AUTH_COOKIE_NAME
ENV NEXT_PUBLIC_APP_SURFACE=$NEXT_PUBLIC_APP_SURFACE
ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Darkube CPU زیاد گزارش می‌دهد ولی سقف thread کم است؛ بدون این،
# «Collecting page data using 34 workers» با os error 11 می‌میرد.
ENV NEXT_CPU_COUNT=1
ENV NODE_OPTIONS=--max-old-space-size=3072

# `NEXT_PUBLIC_IS_DEV` عمداً ست نمی‌شود.
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
