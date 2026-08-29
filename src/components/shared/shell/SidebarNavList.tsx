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
};

/**
 * Shared L1/L2 nav item renderer, extracted out of Sidebar so AdminSidebar
 * can drive the same `visibleMenu` map without duplicating it. Behavior only
 * — no shell-specific chrome lives here.
 */
export function SidebarNavList({
  visibleMenu,
  pathname,
  isCollapsed,
  modulesUnlocked,
  onNavigate,
  className,
}: SidebarNavListProps) {
  return (
    <nav
      className={cn(
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
          />
        ) : (
          <SidebarNavLink
            key={entry.path}
            item={entry}
            isActive={pathname === entry.path}
            isCollapsed={isCollapsed}
            locked={!modulesUnlocked}
            onNavigate={onNavigate}
          />
        )
      )}
    </nav>
  );
}
