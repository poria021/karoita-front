/**
 * DEV-ONLY escape hatch for the admin-gate login step.
 *
 * Context: Nest has no working admin login route yet, so real mode cannot
 * mint a token for the super-admin panel. This skips the OTP round-trip and
 * lands the client in a *locally fabricated* session so the panel's real API
 * calls (e.g. OrgStructureService) can be exercised while backend auth is
 * unblocked separately.
 *
 * NOT a real login — the token is not signed by Nest. If a real endpoint
 * validates the bearer token server-side, calls will still 401; this only
 * bypasses the FRONTEND gate, never backend authorization. Delete this file
 * and its two call sites in auth.service.ts once Nest ships admin login.
 *
 * Deliberately separate from `assertRealModeRejectsMockSecret` (api-mode.ts):
 * that check must keep rejecting the mock OTP everywhere else. This bypass
 * is its own explicit opt-in, scoped to admin-gate only.
 */
import { dispatchSessionToStore } from '@/services/auth/mock-auth.store';
import { writeRealAuthTokens } from '@/services/auth/real-auth.tokens';
import type { User } from '@/types/auth';

const BYPASS_TOKEN_TTL_MS = 1000 * 60 * 60 * 8; // 8h

function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production'
  );
}

/** Fail-closed like resolveApiMode(): production always ignores the flag. */
export function isDevAdminGateBypassEnabled(): boolean {
  if (isProductionRuntime()) return false;
  return process.env.NEXT_PUBLIC_DEV_ADMIN_GATE_BYPASS === 'true';
}

/** Fabricates a local super-admin session; never calls Nest. */
export function devAdminGateBypassLogin(mobile: string): User {
  console.warn(
    '[dev-admin-gate-bypass] Skipping real admin login — using a locally fabricated session. ' +
      'This token is NOT signed by Nest; real API calls will 401 unless the backend leaves ' +
      'that route unguarded for now. Set NEXT_PUBLIC_DEV_ADMIN_GATE_BYPASS=false once Nest ' +
      'admin login works.'
  );

  const user: User = {
    id: `dev-bypass-${mobile}`,
    firstName: 'دسترسی موقت',
    lastName: '(Dev Bypass)',
    mobile,
    role: 'super_admin',
    approved: true,
    docStatus: 'approved',
    hasPassword: true,
  };

  const tokenExpires = Date.now() + BYPASS_TOKEN_TTL_MS;
  const token = `dev-bypass.${mobile}.${Date.now()}`;

  // Fire-and-forget: writeRealAuthTokens is async (it POSTs the refresh
  // token to /api/auth/set-tokens). This is a dev-only fabricated session,
  // so we don't need to await the cookie write before continuing.
  void writeRealAuthTokens({
    token,
    refreshToken: `dev-bypass-refresh.${mobile}.${Date.now()}`,
    tokenExpires,
  });

  dispatchSessionToStore({
    user,
    token,
    expiresAt: new Date(tokenExpires).toISOString(),
  });

  return user;
}
