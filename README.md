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
| `npm run test:e2e:install` | Download Chromium for Playwright (once) |
| `npm run test:e2e` | Thin mock-mode Playwright smoke (`e2e/`) |
| `npm run lint` | ESLint + color/DS checks |

### E2E smoke (mock only)

```bash
# Optional: bundled Chromium (may 403 in some regions — system Chrome is used by default)
npm run test:e2e:install
npm run test:e2e
```

`test:e2e` starts `next dev` on `127.0.0.1:3000` via Playwright `webServer` (mock mode cannot use `next start` / production). Stop any other `next dev` for this repo first — Next 16 allows only one. Forces `NEXT_PUBLIC_API_MODE=mock`. Super-admin smoke uses `/auth/admin-gate` + `MOCK_OTP_CODE` / `MOCK_SUPER_ADMIN_MOBILE` from `src/services/mock/auth-mock-users.ts` (public `/auth/login` blocks admin by design). Config prefers the system Google Chrome channel (Chromium-family only; not Nest/real mode).


## Env

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_API_MODE` | `mock` or `real`. Unset → mock in development, real in production. Explicit `mock` in production throws. |
| `NEXT_PUBLIC_API_URL` | Nest base URL (no trailing slash) for real mode. |
| `NEXT_PUBLIC_AUTH_COOKIE_NAME` | Optional Edge session cookie name (default `karvita_session`). |
