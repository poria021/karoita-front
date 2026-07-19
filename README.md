# Karvita Frontend

Pure Next.js (App Router) frontend for the Karvita education platform.

- **mock** (`NEXT_PUBLIC_API_MODE=mock`): in-browser simulator (`localStorage` + fixed OTP). Local DX only.
- **real**: NestJS API consumer via `NEXT_PUBLIC_API_URL`. Auth/domain facades throw until Nest is wired.
- No in-repo product ORM / Better-Auth / Drizzle. Database lives on Nest later.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` / `start` | Production build |
| `npm test` | Vitest |
| `npm run lint` | ESLint + color/DS checks |

## Env

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_API_MODE` | `mock` or `real`. Unset → mock in development, real in production. Explicit `mock` in production throws. |
| `NEXT_PUBLIC_API_URL` | Nest base URL (no trailing slash) for real mode. |
| `NEXT_PUBLIC_AUTH_COOKIE_NAME` | Optional Edge session cookie name (default `karvita_session`). |
