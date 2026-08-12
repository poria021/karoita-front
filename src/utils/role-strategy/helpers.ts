import { isLiveSidebarPath } from '@/lib/live-nav-paths';
import type { UserRole } from '@/types/auth';

import { ROLE_STRATEGY_MAP } from '@/utils/role-strategy/strategies';
import {
  isSidebarMenuGroup,
  type RoleStrategyConfig,
  type SidebarMenuEntry,
} from '@/utils/role-strategy/types';

export function getRoleStrategy(
  role: UserRole | string | null | undefined
): RoleStrategyConfig {
  if (role && Object.prototype.hasOwnProperty.call(ROLE_STRATEGY_MAP, role)) {
    return ROLE_STRATEGY_MAP[role as UserRole];
  }
  if (process.env.NODE_ENV !== 'production' && role) {
    console.warn(
      `[RoleStrategyMap] نقش ناشناخته «${String(role)}» — بازگشت به student.`
    );
  }
  return ROLE_STRATEGY_MAP.student;
}

export function getVisibleSidebarMenu(
  role: UserRole | string | null | undefined
): SidebarMenuEntry[] {
  return getRoleStrategy(role).sidebarMenu.flatMap(
    (entry): SidebarMenuEntry[] => {
      if (isSidebarMenuGroup(entry)) {
        const children = entry.children.filter((child) =>
          isLiveSidebarPath(child.path)
        );
        if (children.length === 0) return [];
        return [{ ...entry, children }];
      }
      return isLiveSidebarPath(entry.path) ? [entry] : [];
    }
  );
}

export function areKarvitaModulesUnlocked(user: {
  role: UserRole;
  approved: boolean;
}): boolean {
  const strategy = getRoleStrategy(user.role);
  if (!strategy.gateModulesUntilApproved) return true;
  return user.approved;
}

export function isSuperAdminRole(
  role: UserRole | string | null | undefined
): boolean {
  return role === 'super_admin';
}

export function hasPermission(
  user: { role: UserRole } | null | undefined,
  permission: string
): boolean {
  if (!user) return false;
  return getRoleStrategy(user.role).permissions.includes(permission);
}
