'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useId, useRef } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { RouteService } from '@/services/route.service';
import { useUIStore } from '@/store/useUIStore';
import { useUserStore } from '@/store/useUserStore';
import {
  areKarvitaModulesUnlocked,
  getRoleStrategy,
  getVisibleSidebarMenu,
  isSidebarMenuGroup,
} from '@/utils/RoleStrategyMap';
import { faIcons } from '@/utils/iconMap';

import { resolveSidebarIcon } from './resolveSidebarIcon';
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
  const roleIcon = resolveSidebarIcon(strategy.roleIcon);
  const modulesUnlocked = areKarvitaModulesUnlocked(activeUser);
  const profileHref = RouteService.karvita.profile(activeUser.role);

  return (
    <>
      <div
        onClick={closeMobileSidebar}
        aria-hidden={!isMobileOpen}
        className={cn(
          'fixed inset-0 z-40 bg-kv-surface-inverse/40 transition-opacity lg:hidden',
          isMobileOpen
            ? 'pointer-events-auto cursor-pointer opacity-100'
            : 'pointer-events-none opacity-0'
        )}
      />

      <aside
        ref={drawerRef}
        id="karvita-sidebar"
        role={isMobileOpen ? 'dialog' : undefined}
        aria-modal={isMobileOpen ? true : undefined}
        aria-labelledby={isMobileOpen ? drawerTitleId : undefined}
        className={cn(
          'fixed inset-y-0 start-0 z-50 flex shrink-0 flex-col overflow-y-auto border-e border-kv-border/80 bg-kv-surface transition-all duration-300 ease-in-out',
          'lg:sticky lg:top-[calc(4rem+var(--spacing-kv-group))] lg:z-0 lg:h-auto lg:translate-x-0 lg:self-start lg:overflow-y-visible lg:pointer-events-auto lg:visible lg:bg-kv-surface lg:border lg:border-kv-border/80 lg:rounded-kv-shell lg:shadow-kv-raised',
          isMobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
          !isMobileOpen && 'max-lg:pointer-events-none max-lg:invisible',
          isCollapsed ? 'w-72 lg:w-20' : 'w-72 lg:w-60'
        )}
      >
        <KvButton
          type="button"
          color="neutral"
          appearance="ghost"
          size="sm"
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? 'باز کردن نوار کناری' : 'جمع کردن نوار کناری'}
          className="absolute -end-3 top-6 z-20 hidden size-7 min-h-0 rounded-kv-control border border-kv-border-strong/80 bg-kv-surface p-0 text-kv-text-subtle shadow-kv-raised hover:border-kv-brand hover:text-kv-brand lg:flex"
          icon={
            <FaIcon
              icon={faIcons.chevronLeft}
              size="xs"
              className={cn(
                'transition-transform duration-300',
                isCollapsed ? 'rotate-180 rtl:rotate-0' : 'rotate-0 rtl:rotate-180'
              )}
            />
          }
        />

        <div className="flex items-center justify-between gap-kv-inline border-b border-kv-border-muted p-kv-group lg:hidden">
          <div className="flex min-w-0 items-center gap-kv-inline">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand text-kv-brand-fg shadow-kv-raised shadow-kv-brand/20">
              <FaIcon icon={faIcons.tableColumns} size="sm" />
            </div>
            <div className="flex min-w-0 flex-col text-start">
              <KvTypography variant="subtitle" as="h2" id={drawerTitleId} truncate>
                پنل کاربری - {strategy.label}
              </KvTypography>
              <div className="mt-kv-nav-tight">
                <KvTypography variant="overline" tone="muted" as="p" truncate>
                  سامانه جامع کارویتا
                </KvTypography>
              </div>
            </div>
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

        <Link
          href={profileHref}
          prefetch={false}
          onClick={closeMobileSidebar}
          aria-label={`پروفایل ${activeUser.firstName} ${activeUser.lastName}`}
          className={cn(
            'border-t border-kv-border-muted bg-kv-surface transition-colors hover:bg-kv-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kv-ring/30 lg:rounded-b-kv-shell',
            isCollapsed ? 'p-kv-group lg:p-kv-pair' : 'p-kv-group'
          )}
        >
          <div
            className={cn(
              'flex items-center rounded-kv-control border border-kv-border-muted bg-kv-surface-muted transition-all',
              isCollapsed
                ? 'justify-start p-kv-inline lg:justify-center lg:p-kv-pair'
                : 'p-kv-inline'
            )}
          >
            <div className="relative flex size-9 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand/10 text-kv-brand-soft-fg">
              <FaIcon icon={roleIcon} size="sm" />
            </div>
            <div
              className={cn(
                'flex min-w-0 flex-col overflow-hidden transition-all',
                isCollapsed
                  ? 'ms-kv-inline max-w-[150px] opacity-100 lg:ms-0 lg:max-w-0 lg:opacity-0'
                  : 'ms-kv-inline max-w-[150px] opacity-100'
              )}
            >
              <KvTypography variant="subtitle" as="p" truncate>
                {activeUser.firstName} {activeUser.lastName}
              </KvTypography>
              <div className="mt-kv-micro">
                <KvTypography variant="caption" tone="muted" as="p" truncate>
                  {strategy.label}
                </KvTypography>
              </div>
            </div>
          </div>
        </Link>
      </aside>
    </>
  );
}
