import { kvScrollAreaClassName } from '@/components/shared/KvScrollArea';
import type { KvShellRailTextSize } from '@/components/shared/shell/shellChrome';
import { cn } from '@/lib/utils';
import {
  isSidebarMenuGroup,
  type SidebarMenuEntry,
} from '@/utils/RoleStrategyMap';

import { SidebarNavGroup } from './SidebarNavGroup';
import { SidebarNavLink } from './SidebarNavLink';

export type SidebarNavListProps = {
  visibleMenu: SidebarMenuEntry[];
  pathname: string;
  isCollapsed: boolean;
  modulesUnlocked: boolean;
  onNavigate: () => void;
  className?: string;
  textSize?: KvShellRailTextSize;
};

/**
 * رندر مشترک آیتم `L1`/`L2` — از `Sidebar` جدا شد تا `AdminSidebar` همان `visibleMenu` را بدون تکرار براند.
 * فقط رفتار؛ کروم مخصوص شل اینجا نیست.
 */
export function SidebarNavList({
  visibleMenu,
  pathname,
  isCollapsed,
  modulesUnlocked,
  onNavigate,
  className,
  textSize = 'compact',
}: SidebarNavListProps) {
  return (
    <nav
      className={cn(
        kvScrollAreaClassName,
        'flex-1 space-y-kv-inline overflow-y-auto p-kv-group lg:overflow-y-visible lg:p-kv-inline lg:pt-kv-stack lg:pb-kv-page',
        className
      )}
      aria-label="منوی اصلی"
    >
      {visibleMenu.map((entry) =>
        isSidebarMenuGroup(entry) ? (
          <SidebarNavGroup
            key={`group:${entry.title}`}
            group={entry}
            pathname={pathname}
            isCollapsed={isCollapsed}
            locked={!modulesUnlocked}
            onNavigate={onNavigate}
            textSize={textSize}
          />
        ) : (
          <SidebarNavLink
            key={entry.path}
            item={entry}
            isActive={pathname === entry.path}
            isCollapsed={isCollapsed}
            locked={!modulesUnlocked}
            onNavigate={onNavigate}
            textSize={textSize}
          />
        )
      )}
    </nav>
  );
}
