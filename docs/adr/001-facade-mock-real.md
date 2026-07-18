# ADR-001: Facade + mock/real API mode

## Status
Accepted

## Context
The Next.js app is a pure frontend consumer of an external Nest API (eventually). Until Nest is wired, Facades in `src/services/` must serve the same TypeScript DTOs from a local mock simulator. Juniors often confuse mock localStorage/OTP with production auth.

## Decision
1. Every HTTP/domain mutation goes through a Facade (`AuthService`, `OrgStructureService`, …) — never `fetch` from features.
2. Mode is resolved only via `resolveApiMode()` / `isMockApiMode()` (`NEXT_PUBLIC_API_MODE`).
3. Mock and real return the same public types from `src/types/`.
4. Production + explicit `mock` **fail-closed** (throw). Real mode never accepts mock secrets (`MOCK_OTP_CODE`).
5. Messages and storage keys are labeled as simulator (`karvita_mock_*`, «شبیه‌ساز محلی») so mock is not mistaken for Nest.

## Consequences
- UI stays stable when swapping mock → Nest inside the Facade.
- Mock is DX-only: soft authz in Facades is not Nest authorization.
- Tests (`api-mode.test.ts`) lock the boundary.

## See also
- `src/lib/api-mode.ts`
- `.cursor/rules/40-service-layer-facade.mdc`
- `.cursor/rules/45-frontend-auth-security.mdc`
