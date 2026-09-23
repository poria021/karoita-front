'use client';

import { usePathname } from 'next/navigation';
import { useId, useRef } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KarvitaBrandMark } from '@/components/shared/KarvitaBrandMark';
import { KvButton } from '@/components/shared/KvButton';
import { HeaderBrandWordmark } from '@/components/shared/shell/HeaderBrandWordmark';
import { SidebarNavList } from '@/components/shared/shell/SidebarNavList';
import { kvScrollAreaClassName } from '@/components/shared/KvScrollArea';
import {
  kvShellAdminRailMotionClassName,
  kvShellAdminRailWidthMotionClassName,
  kvShellRailLabelMotionClassName,
} from '@/components/shared/shell/shellChrome';
import { UserAccountMenu } from '@/components/shared/shell/UserAccountMenu';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/useUIStore';
import { useUserStore } from '@/store/useUserStore';
import {
  areKarvitaModulesUnlocked,
  getRoleStrategy,
  getVisibleSidebarMenu,
} from '@/utils/RoleStrategyMap';
import { faIcons } from '@/utils/iconMap';

import { useSidebarMobileDrawer } from './useSidebarMobileDrawer';

/**
 * ریل ستادی — `fixed` تمام‌قد در لبهٔ شروع (RTL = راست). برند اینجاست نه در هدر.
 * خارج از جریان؛ هدر و `main` با `kvShellAdminRailClearanceClassName` خالی می‌کنند.
 * ناوبار و دراور موبایل با `Sidebar` مشترکند (`SidebarNavList` / `useSidebarMobileDrawer`).
 */
export function AdminSidebar() {
  const activeUser = useUserStore((state) => state.activeUser);
  const isCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const isMobileOpen = useUIStore((state) => state.isMobileSidebarOpen);
  const toggleCollapsed = useUIStore((state) => state.toggleSidebarCollapsed);
  const closeMobileSidebar = useUIStore((state) => state.closeMobileSidebar);
  const pathname = usePathname();
  const drawerTitleId = useId();
  const drawerRef = useRef<HTMLDivElement>(null);

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

      <div
        className={cn(
          'fixed inset-y-0 inset-s-0 z-50 h-dvh',
          kvShellAdminRailWidthMotionClassName,
          'lg:translate-x-0 lg:pointer-events-auto lg:visible',
          isMobileOpen
            ? 'translate-x-0'
            : 'max-lg:-translate-x-full max-lg:rtl:translate-x-full',
          !isMobileOpen && 'max-lg:pointer-events-none max-lg:invisible',
          isCollapsed ? 'w-72 lg:w-24' : 'w-72 lg:w-72'
        )}
      >
        <div
          ref={drawerRef}
          id="karvita-admin-sidebar"
          role={isMobileOpen ? 'dialog' : undefined}
          aria-modal={isMobileOpen ? true : undefined}
          aria-labelledby={isMobileOpen ? drawerTitleId : undefined}
          className="group/sidebar flex h-full min-h-0 w-full flex-col border-e border-kv-border/80 bg-kv-surface"
        >
          <div
            className={cn(
              'relative flex shrink-0 items-center justify-between gap-kv-inline border-b border-kv-border-muted p-kv-group',
              isCollapsed && 'lg:justify-center'
            )}
          >
            <div
              className={cn(
                'flex min-w-0 items-center',
                isCollapsed && 'lg:justify-center'
              )}
            >
              <KarvitaBrandMark />
              <div
                className={cn(
                  'min-w-0',
                  kvShellRailLabelMotionClassName,
                  isCollapsed
                    ? 'ms-kv-inline max-h-16 max-w-48 opacity-100 lg:pointer-events-none lg:ms-0 lg:max-h-0 lg:max-w-0 lg:opacity-0'
                    : 'ms-kv-inline max-h-16 max-w-48 opacity-100'
                )}
              >
                <HeaderBrandWordmark textSize="legible" />
              </div>
              <h2 id={drawerTitleId} className="sr-only">
                کارویتا — پنل مدیریت - {strategy.label}
              </h2>
            </div>
            <KvButton
              type="button"
              color="neutral"
              appearance="ghost"
              size="md"
              onClick={closeMobileSidebar}
              aria-label="بستن منو"
              className="shrink-0 rounded-full bg-kv-surface-subtle text-kv-text-subtle hover:bg-kv-danger-soft hover:text-kv-danger lg:hidden"
              icon={<FaIcon icon={faIcons.xmark} size="sm" />}
            />
            <KvButton
              type="button"
              color="neutral"
              appearance="ghost"
              size="sm"
              onClick={toggleCollapsed}
              aria-label={
                isCollapsed ? 'باز کردن نوار کناری' : 'جمع کردن نوار کناری'
              }
              className="absolute -inset-e-2.5 top-1/2 z-20 hidden size-6 min-h-0 -translate-y-1/2 rounded-kv-control border border-kv-border/80 bg-kv-surface p-0 text-kv-text-subtle shadow-kv-soft hover:border-kv-brand hover:text-kv-brand lg:flex"
              icon={
                <FaIcon
                  icon={faIcons.chevronLeft}
                  size="xs"
                  className={cn(
                    'transition-transform',
                    kvShellAdminRailMotionClassName,
                    isCollapsed
                      ? 'rotate-180 rtl:rotate-0'
                      : 'rotate-0 rtl:rotate-180'
                  )}
                />
              }
            />
          </div>

          <aside
            className={cn(
              'flex min-h-0 flex-1 flex-col overflow-y-auto lg:overflow-hidden',
              kvScrollAreaClassName,
              'kv-sidebar-scroll'
            )}
          >
            <SidebarNavList
              visibleMenu={visibleMenu}
              pathname={pathname}
              isCollapsed={isCollapsed}
              modulesUnlocked={modulesUnlocked}
              onNavigate={closeMobileSidebar}
              textSize="legible"
              className={cn(
                'lg:overflow-y-auto',
                kvScrollAreaClassName,
                'kv-sidebar-scroll'
              )}
            />

            <UserAccountMenu
              variant="sidebar"
              isCollapsed={isCollapsed}
              onNavigate={closeMobileSidebar}
              textSize="legible"
            />
          </aside>
        </div>
      </div>
    </>
  );
}
