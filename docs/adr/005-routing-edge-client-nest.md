# ADR 005 — Routing: Edge presence vs client role vs Nest authz

## Status
Accepted

## Context
Karvita is a pure Next.js frontend. Mock mode uses a non-httpOnly session marker; real mode will use Better Auth / Nest httpOnly cookies. Browser Zustand `role` is forgeable.

## Decision
1. **Edge (`src/proxy.ts`):** session presence only — redirect anonymous users to login with a safe `returnUrl`; never authorize by role from client-writable cookies.
2. **Client:** `getPostLoginPath` / `resolvePostAuthPath`, `KarvitaModuleAccessGuard`, and live-nav filtering provide UX routing (approval lock, admin plane under `/karvita/admin/*`).
3. **Nest (future):** sole authorization boundary for data and mutations. FE gates are not security proofs.

## Consequences
- Super-admin may briefly hit the default user dashboard from Edge until the client corrects landing — acceptable until Nest ships role claims.
- Admin modules stay under `/karvita/admin/` so one prefix gate covers deep links without relying on page-only checks.
- Adding a module requires: `page.tsx` + RouteService path + live-nav allowlist + optional RoleStrategyMap menu entry.
