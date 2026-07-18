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

## Consequences
- Juniors must not treat mock soft-authz as “secure.”
- Nest remains the only real authorization plane when wired.
- Residual mock threats (forged role, fixed OTP) are intentional and documented in Phase A.

## See also
- `.cursor/rules/45-frontend-auth-security.mdc`
- `src/services/mock/mock-authz.ts`
- `src/proxy.ts`
