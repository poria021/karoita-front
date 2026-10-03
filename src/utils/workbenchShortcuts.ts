import { RouteService } from '@/services/route.service';
import {
  getVisibleSidebarMenu,
  isSidebarMenuGroup,
  type SidebarMenuEntry,
  type SidebarMenuItem,
} from '@/utils/RoleStrategyMap';
import type { UserRole } from '@/types/auth';

const WORKBENCH_HOME_PATHS = new Set([
  RouteService.karvita.dashboard(),
  RouteService.karvita.adminDashboard(),
]);

/**
 * میان‌برهای زندهٔ میز کار از منوی نقش (فقط مسیرهای live؛ بدون خود میز کار).
 * `menu` = منوی سایدبار با درس‌های داینامیک؛ بدون آن منوی ایستای نقش.
 */
export function getLiveWorkbenchShortcuts(
  role: UserRole | string | null | undefined,
  menu: SidebarMenuEntry[] = getVisibleSidebarMenu(role)
): SidebarMenuItem[] {
  const items: SidebarMenuItem[] = [];

  for (const entry of menu) {
    if (isSidebarMenuGroup(entry)) {
      for (const child of entry.children) {
        if (!WORKBENCH_HOME_PATHS.has(child.path)) {
          items.push(child);
        }
      }
      continue;
    }
    if (!WORKBENCH_HOME_PATHS.has(entry.path)) {
      items.push(entry);
    }
  }

  return items;
}
