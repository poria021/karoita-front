'use client';

import { usePathname } from 'next/navigation';
import { useId, useRef } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KarvitaBrandMark } from '@/components/shared/KarvitaBrandMark';
import { KvButton } from '@/components/shared/KvButton';
import { UserAccountMenu } from '@/components/shared/shell/UserAccountMenu';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/useUIStore';
import { useUserStore } from '@/store/useUserStore';
import {
  areKarvitaModulesUnlocked,
  getRoleStrategy,
  getVisibleSidebarMenu,
  isSidebarMenuGroup,
} from '@/utils/RoleStrategyMap';
import { faIcons } from '@/utils/iconMap';

import { SidebarNavGroup } from './SidebarNavGroup';
import { SidebarNavLink } from './SidebarNavLink';
import { useSidebarMobileDrawer } from './useSidebarMobileDrawer';

export function Sidebar() {
  const activeUser = useUserStore((state) => state.activeUser);
  const isCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const isMobileOpen = useUIStore((state) => state.isMobileSidebarOpen);
  const toggleCollapsed = useUIStore((state) => state.toggleSidebarCollapsed);
  const closeMobileSidebar = useUIStore((state) => state.closeMobileSidebar);
  const pathname = usePathname();
  const drawerTitleId = useId();
  const drawerRef = useRef<HTMLElement>(null);

  useSidebarMobileDrawer({
    isMobileOpen,
    drawerRef,
    onClose: closeMobileSidebar,
  });

  if (!activeUser) return null;

  const strategy = getRoleStrategy(activeUser.role);
  const visibleMenu = getVisibleSidebarMenu(activeUser.role);
  const modulesUnlocked = areKarvitaModulesUnlocked(activeUser);

  return (
    <>
      <div
        onClick={closeMobileSidebar}
        aria-hidden={!isMobileOpen}
        className={cn(
          'fixed inset-0 z-40 bg-kv-scrim/50 transition-opacity lg:hidden',
          isMobileOpen
            ? 'pointer-events-auto cursor-pointer opacity-100'
            : 'pointer-events-none opacity-0'
        )}
      />

      {/*
        Wrapper owns sticky + collapse-btn overflow; panel clips to shell radius
        so the account footer cannot square-off the bottom corners.
      */}
      <div
        className={cn(
          'fixed inset-y-0 start-0 z-50 transition-all duration-300 ease-in-out',
          'lg:sticky lg:top-[calc(4rem+var(--spacing-kv-group))] lg:z-0 lg:mt-kv-group lg:h-auto lg:translate-x-0 lg:self-start lg:pointer-events-auto lg:visible',
          isMobileOpen
            ? 'translate-x-0'
            : '-translate-x-full rtl:translate-x-full lg:translate-x-0',
          !isMobileOpen && 'max-lg:pointer-events-none max-lg:invisible',
          isCollapsed ? 'w-72 lg:w-20' : 'w-72 lg:w-60'
        )}
      >
        <aside
          ref={drawerRef}
          id="karvita-sidebar"
          role={isMobileOpen ? 'dialog' : undefined}
          aria-modal={isMobileOpen ? true : undefined}
          aria-labelledby={isMobileOpen ? drawerTitleId : undefined}
          className={cn(
            'flex h-full min-h-0 w-full shrink-0 flex-col overflow-y-auto border-e border-kv-border/80 bg-kv-surface',
            'lg:h-auto lg:overflow-hidden lg:border lg:border-kv-border/80 lg:rounded-kv-shell'
          )}
        >
          <div className="flex items-center justify-between gap-kv-inline border-b border-kv-border-muted p-kv-group lg:hidden">
            <div className="flex min-w-0 items-center gap-kv-inline">
              <KarvitaBrandMark />
              <h2 id={drawerTitleId} className="sr-only">
                کارویتا — پنل کاربری - {strategy.label}
              </h2>
            </div>
            <KvButton
              type="button"
              color="neutral"
              appearance="ghost"
              size="md"
              onClick={closeMobileSidebar}
              aria-label="بستن منو"
              className="shrink-0 rounded-full bg-kv-surface-subtle text-kv-text-subtle hover:bg-kv-danger-soft hover:text-kv-danger"
              icon={<FaIcon icon={faIcons.xmark} size="sm" />}
            />
          </div>

          <nav
            className="flex-1 space-y-kv-inline overflow-y-auto p-kv-group lg:overflow-y-visible lg:p-kv-inline lg:pt-kv-stack lg:pb-kv-page"
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
                  onNavigate={closeMobileSidebar}
                />
              ) : (
                <SidebarNavLink
                  key={entry.path}
                  item={entry}
                  isActive={pathname === entry.path}
                  isCollapsed={isCollapsed}
                  locked={!modulesUnlocked}
                  onNavigate={closeMobileSidebar}
                />
              )
            )}
          </nav>

          <UserAccountMenu
            variant="sidebar"
            isCollapsed={isCollapsed}
            onNavigate={closeMobileSidebar}
          />
        </aside>

        <KvButton
          type="button"
          color="neutral"
          appearance="ghost"
          size="sm"
          onClick={toggleCollapsed}
          aria-label={
            isCollapsed ? 'باز کردن نوار کناری' : 'جمع کردن نوار کناری'
          }
          className="absolute -end-2.5 top-3 z-20 hidden size-6 min-h-0 rounded-kv-control border border-kv-border/80 bg-kv-surface p-0 text-kv-text-subtle shadow-kv-soft hover:border-kv-brand hover:text-kv-brand lg:flex"
          icon={
            <FaIcon
              icon={faIcons.chevronLeft}
              size="xs"
              className={cn(
                'transition-transform duration-300',
                isCollapsed
                  ? 'rotate-180 rtl:rotate-0'
                  : 'rotate-0 rtl:rotate-180'
              )}
            />
          }
        />
      </div>
    </>
  );
}
