import type { UserRole } from '@/types/auth';
import { ROLE_STRATEGY_MAP } from '@/utils/RoleStrategyMap';

/** slug نقش برای پارامتر مسیر — از `RoleStrategyMap` (منبع واحد). */
export const USER_ROLES = Object.keys(ROLE_STRATEGY_MAP) as UserRole[];

export function isUserRole(value: string): value is UserRole {
  return Object.hasOwn(ROLE_STRATEGY_MAP, value);
}

export function parseUserRole(value: string): UserRole | null {
  return isUserRole(value) ? value : null;
}
