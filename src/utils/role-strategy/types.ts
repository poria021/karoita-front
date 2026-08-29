import type { UserRole } from '@/types/auth';

export interface SidebarMenuItem {
  kind?: 'item';
  title: string;
  path: string;
  icon: string;
  /** Persian course-level badge composed onto `icon` (کارورزی/کارآموزی ۱…). */
  iconBadge?: number;
}

export interface SidebarMenuGroup {
  kind: 'group';
  title: string;
  icon: string;
  children: SidebarMenuItem[];
  /** اگر true باشد گروه از ابتدا باز است تا زیرماژول‌ها دیده شوند. */
  defaultOpen?: boolean;
}

export type SidebarMenuEntry = SidebarMenuItem | SidebarMenuGroup;

export function isSidebarMenuGroup(
  entry: SidebarMenuEntry
): entry is SidebarMenuGroup {
  return entry.kind === 'group';
}

export interface RoleStrategyConfig {
  label: string;
  badge: string;
  roleIcon: string;
  layoutWidthClass: string;
  gateModulesUntilApproved: boolean;
  sidebarMenu: SidebarMenuEntry[];
  permissions: string[];
}

export type RoleStrategyMap = Record<UserRole, RoleStrategyConfig>;
