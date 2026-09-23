import { isRealApiMode } from '@/lib/api-mode';
import { useUserStore } from '@/store/useUserStore';
import {
  hasPermission,
  isStaffAdminRole,
  isSuperAdminRole,
} from '@/utils/RoleStrategyMap';


export const MOCK_AUTHZ_DENIED =
  'دسترسی کافی نیست. (بررسی شبیه‌ساز محلی — جایگزین authorization سرور Nest نیست.)';

export const MOCK_SIMULATOR_ONLY =
  'این مسیر فقط در حالت شبیه‌ساز محلی (mock) در دسترس است، نه API واقعی Nest.';

/** real mode (چه dev چه production) مسدود است — mock فقط در حالت mock در دسترس است. */
export function assertMockSimulator(): void {
  if (isRealApiMode()) {
    throw new Error(MOCK_SIMULATOR_ONLY);
  }
}

export function assertMockClientHasPermission(permission: string): void {
  assertMockSimulator();
  const user = useUserStore.getState().activeUser;
  if (!hasPermission(user, permission)) {
    throw new Error(MOCK_AUTHZ_DENIED);
  }
}

export function assertMockClientIsSuperAdmin(): void {
  assertMockSimulator();
  const user = useUserStore.getState().activeUser;
  if (!user || !isSuperAdminRole(user.role)) {
    throw new Error(MOCK_AUTHZ_DENIED);
  }
}

export function assertMockClientIsStaffAdmin(): void {
  assertMockSimulator();
  const user = useUserStore.getState().activeUser;
  if (!user || !isStaffAdminRole(user.role)) {
    throw new Error(MOCK_AUTHZ_DENIED);
  }
}
