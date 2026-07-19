# ADR-004: Client auth ≠ authorization

## Status
Accepted

## Context
Zustand `activeUser.role`, localStorage mock users, and the Edge `MOCK_SESSION_MARKER` cookie are all browser-writable. Treating them as security boundaries creates false confidence — especially in mock mode.

## Decision
1. **UI ≠ authorization.** Sidebar, route guards, and `hasPermission` hide/show chrome only.
2. Edge/proxy session checks are **presence-only** for mock (marker cookie is not identity/role).
3. Sensitive mutations go Facade → (mock soft-check | Nest). Mock soft-checks (`assertMockClientHasPermission`) simulate server checks for DX; they are **not** production authz.
4. Real mode: no JS-readable bearer for Nest; prefer httpOnly cookies. Never accept `MOCK_OTP_CODE`.
5. Do not invent role claims in Edge from client cookies until Nest issues httpOnly claims.
6. **Auth audience split (public ≠ admin gate):**
   - Public (`/auth/login`, forgot, public OTP/password): Nest + mock **reject** `super_admin` with the same user-not-found copy (do not reveal admin identity).
   - Admin (`/auth/admin-gate`, future admin subdomain): Nest + mock **allow only** senior admin.
   - `NEXT_PUBLIC_APP_SURFACE=user|admin` only picks entry chrome for split hostnames; it is not authz.
7. Real HTTP paths live in `src/services/auth/real-auth.bridge.ts` (`REAL_AUTH_PATHS`). Flip `NEST_AUTH_LIVE` when Nest is deployed.

## Nest switch checklist
1. `NEXT_PUBLIC_API_MODE=real` and `NEXT_PUBLIC_API_URL=<Nest base>`.
2. Set `NEST_AUTH_LIVE = true` in `real-auth.bridge.ts` after endpoints verified.
3. Align cookie name (`NEXT_PUBLIC_AUTH_COOKIE_NAME`) + CORS/`credentials` for the app host.
4. On admin subdomain set `NEXT_PUBLIC_APP_SURFACE=admin` (login redirects to admin-gate).
5. Confirm Nest rejects `super_admin` on public forgot/login and allows them only on admin OTP.

## Consequences
- Juniors must not treat mock soft-authz as “secure.”
- Nest remains the only real authorization plane when wired.
- Residual mock threats (forged role, fixed OTP) are intentional and documented in Phase A.

## See also
- `.cursor/rules/45-frontend-auth-security.mdc`
- `src/services/mock/mock-authz.ts`
- `src/services/auth/real-auth.bridge.ts`
- `src/proxy.ts`
