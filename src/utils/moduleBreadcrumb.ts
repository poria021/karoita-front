import { RouteService } from '@/services/route.service';
import type { UserRole } from '@/types/auth';
import {
  getRoleStrategy,
  isSidebarMenuGroup,
  type SidebarMenuItem,
} from '@/utils/RoleStrategyMap';
import { getModuleMeta } from '@/utils/moduleMeta';

export type ModuleBreadcrumbItem = {
  label: string;
  /** روی خردهٔ جاری و برچسب گروه بدون مسیر نیست. */
  href?: string;
};

function normalizePath(pathname: string): string {
  if (!pathname) return '/';
  const withoutQuery = pathname.split('?')[0] ?? pathname;
  const trimmed = withoutQuery.replace(/\/+$/, '');
  return trimmed.length > 0 ? trimmed : '/';
}

function isProfilePath(path: string): boolean {
  return /^\/karvita\/[^/]+\/profile$/.test(path);
}

function resolveHomeItem(role?: UserRole | null): SidebarMenuItem {
  const menu = getRoleStrategy(role).sidebarMenu;
  for (const entry of menu) {
    if (isSidebarMenuGroup(entry)) continue;
    if (
      entry.path === RouteService.karvita.dashboard() ||
      entry.path === RouteService.karvita.adminDashboard()
    ) {
      return entry;
    }
  }
  return {
    title: 'میز کار',
    path: RouteService.karvita.dashboard(),
    icon: 'fa-home',
  };
}

/**
 * مسیر نمایشی صفحه برای هدر ماژول (جایگزین ساب‌تایتل).
 * گروه سایدبار → عنوان گروه + صفحه؛ آیتم تخت → میز کار + صفحه.
 */
export function getModuleBreadcrumb(
  pathname: string,
  role?: UserRole | null
): ModuleBreadcrumbItem[] {
  const path = normalizePath(pathname);
  const home = resolveHomeItem(role);
  const menu = getRoleStrategy(role).sidebarMenu;

  if (isProfilePath(path)) {
    return [
      { label: home.title, href: home.path },
      { label: getModuleMeta(path, role).title },
    ];
  }

  if (path === home.path) {
    return [{ label: home.title }];
  }

  for (const entry of menu) {
    if (isSidebarMenuGroup(entry)) {
      const child = entry.children.find((c) => c.path === path);
      if (child) {
        return [{ label: entry.title }, { label: child.title }];
      }
      continue;
    }
    if (entry.path === path) {
      return [
        { label: home.title, href: home.path },
        { label: entry.title },
      ];
    }
  }

  return [
    { label: home.title, href: home.path },
    { label: getModuleMeta(path, role).title },
  ];
}
