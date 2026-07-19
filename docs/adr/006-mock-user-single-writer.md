# ADR-006: Single mock user writer

## Status
Accepted (updated)

## Context
Profile mock persistence previously wrote a parallel `karvita_local_db` (and legacy `current_user`) while auth used `karvita_mock_auth_users`. Onboarding via `UserService` only patched Zustand. Approvals and login read the auth store — profiles could drift.

## Decision
1. **Canonical mock users:** `karvita_mock_auth_users` via `src/services/auth/mock-auth.store.ts`.
2. **Single patch API:** `patchMockAuthUser` for profile / onboarding / approvals field updates; syncs Zustand when the active user matches.
3. **One profile Facade:** `ProfileService` (`src/services/profile.service.ts`) owns portal identity + onboarding (`updateOnboardingProfile`). `UserService` is a thin deprecated shim.
4. **Zustand** remains session chrome (`karvita-user-store`), not a second source of truth for the mock user directory.
5. **No feature-local profile HTTP** — feature folder may only re-export the global Facade (rule 40).

## Consequences
- Approvals, login, and profile share one directory in mock mode.
- Nest real mode: Profile may call `apiClient`; other Facades use `throwRealModeNotImplemented` until wired.
- Callers must not double-write Zustand after Facade success — `patchMockAuthUser` already syncs.

## See also
- `.cursor/rules/40-service-layer-facade.mdc`
- `src/services/profile.service.ts`
- `docs/adr/007-list-data-fetch.md`
