import { isMockApiMode } from '@/lib/api-mode';
import { useUserStore } from '@/store/useUserStore';
import {
  hasPermission,
  isSuperAdminRole,
} from '@/utils/RoleStrategyMap';

/**
 * Client-side mock authorization helpers (rule 45).
 *
 * Purpose: simulate a server permission check inside Facades while
 * `NEXT_PUBLIC_API_MODE=mock`. This is UX / DX hygiene for juniors and
 * soft-gates destructive mock mutations.
 *
 * NOT Nest authorization. Browser `activeUser.role` can be forged via
 * localStorage / DevTools. Real mode must re-validate on the API.
 */

export const MOCK_AUTHZ_DENIED =
  'دسترسی کافی نیست. (بررسی شبیه‌ساز محلی — جایگزین authorization سرور Nest نیست.)';

export const MOCK_SIMULATOR_ONLY =
  'این مسیر فقط در حالت شبیه‌ساز محلی (mock) در دسترس است، نه API واقعی Nest.';

/** Fail if called outside mock — keeps real mode from touching mock authz. */
export function assertMockSimulator(): void {
  if (!isMockApiMode()) {
    throw new Error(MOCK_SIMULATOR_ONLY);
  }
}

/**
 * Require `activeUser` to list `permission` in RoleStrategyMap.
 * Browser role can still be forged — Nest must re-check in real mode.
 */
export function assertMockClientHasPermission(permission: string): void {
  assertMockSimulator();
  const user = useUserStore.getState().activeUser;
  if (!hasPermission(user, permission)) {
    throw new Error(MOCK_AUTHZ_DENIED);
  }
}

/** Require `super_admin` for admin-plane mock facades. */
export function assertMockClientIsSuperAdmin(): void {
  assertMockSimulator();
  const user = useUserStore.getState().activeUser;
  if (!user || !isSuperAdminRole(user.role)) {
    throw new Error(MOCK_AUTHZ_DENIED);
  }
}
