'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, LayoutDashboard, X } from 'lucide-react';

import { useUserStore } from '@/store/useUserStore';
import { useUIStore } from '@/store/useUIStore';
import { getRoleStrategy, type SidebarMenuItem } from '@/utils/RoleStrategyMap';
import { iconMap } from '@/utils/iconMap';
import { RouteService } from '@/services/route.service';
import { cn } from '@/lib/utils';
import { KvTypography } from '@/components/shared/KvTypography';

/** Resolves a legacy `fa-*` icon key to its mapped Lucide component (falls back to a generic icon). */
function resolveIcon(iconKey: string) {
  return iconMap[iconKey] ?? LayoutDashboard;
}

/**
 * Responsive, role-driven navigation sidebar (rule 00, #9-#10): menu items
 * come exclusively from `RoleStrategyMap`, never from inline role checks.
 *
 * Reads only the individual `useUserStore`/`useUIStore` selectors it needs
 * (rule 50, #4) so unrelated store updates never re-render this component.
 */
export function Sidebar() {
  const activeUser = useUserStore((state) => state.activeUser);
  const isCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const isMobileOpen = useUIStore((state) => state.isMobileSidebarOpen);
  const toggleCollapsed = useUIStore((state) => state.toggleSidebarCollapsed);
  const closeMobileSidebar = useUIStore((state) => state.closeMobileSidebar);
  const pathname = usePathname();

  if (!activeUser) return null;

  const strategy = getRoleStrategy(activeUser.role);
  const RoleIcon = resolveIcon(strategy.roleIcon);

  return (
    <>
      {/* Mobile overlay, dismisses the drawer on outside click. */}
      <div
        onClick={closeMobileSidebar}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/40 transition-opacity lg:hidden',
          isMobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

<aside
        className={cn(
          'fixed inset-y-0 start-0 z-50 flex shrink-0 flex-col overflow-y-auto border-e border-slate-200/80 bg-white transition-all duration-300 ease-in-out',
          'lg:sticky lg:top-[88px] lg:z-0 lg:h-auto lg:translate-x-0 lg:self-start lg:overflow-y-visible lg:bg-white lg:border lg:border-slate-200/80 lg:rounded-3xl lg:shadow-sm',
          isMobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
          isCollapsed ? 'w-72 lg:w-20' : 'w-72 lg:w-60'
        )}
      >
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label="تغییر وضعیت نوار کناری"
          className="absolute -end-3 top-6 z-20 hidden size-6 items-center justify-center rounded-full border border-slate-300/80 bg-white text-slate-500 shadow-sm transition-all hover:border-brand-500 hover:text-brand-500 hover:shadow-md lg:flex"
        >
          <ChevronLeft
            className={cn('size-3 transition-transform duration-300', isCollapsed ? 'rotate-180 rtl:rotate-0' : 'rotate-0 rtl:rotate-180')}
            aria-hidden="true"
          />
        </button>

        {/* Mobile-only header inside the drawer. */}
        <div className="flex items-center justify-between gap-kv-inline border-b border-slate-100 p-4 lg:hidden">
          <div className="flex min-w-0 items-center gap-kv-inline">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm shadow-brand-500/20">
              <LayoutDashboard className="size-4" aria-hidden="true" />
            </div>
            <div className="flex min-w-0 flex-col text-start">
              <KvTypography variant="subtitle" as="h2" truncate>
                پنل کاربری - {strategy.label}
              </KvTypography>
              <div className="mt-1">
                <KvTypography variant="overline" tone="muted" as="p" truncate>
                  سامانه جامع کارویتا
                </KvTypography>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={closeMobileSidebar}
            aria-label="بستن منو"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 p-4 lg:p-3 lg:pt-kv-stack lg:pb-8">
          {strategy.sidebarMenu.map((item) => (
            <SidebarNavLink key={item.path} item={item} isActive={pathname === item.path} isCollapsed={isCollapsed} onNavigate={closeMobileSidebar} />
          ))}
        </nav>

        <Link
          href={RouteService.karvita.profile(activeUser.role)}
          prefetch={false}
          onClick={closeMobileSidebar}
          className={cn('border-t border-slate-100 bg-white transition-colors hover:bg-slate-50 lg:rounded-b-3xl', isCollapsed ? 'p-4 lg:p-2' : 'p-4')}
        >
          <div
            className={cn(
              'flex items-center rounded-xl border border-slate-100 bg-slate-50 transition-all',
              isCollapsed ? 'justify-start p-3 lg:justify-center lg:p-2' : 'p-3'
            )}
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600">
              <RoleIcon className="size-4" aria-hidden="true" />
            </div>
            <div
              className={cn(
                'flex min-w-0 flex-col overflow-hidden transition-all',
                isCollapsed ? 'ms-3 max-w-[150px] opacity-100 lg:ms-0 lg:max-w-0 lg:opacity-0' : 'ms-3 max-w-[150px] opacity-100'
              )}
            >
              <KvTypography variant="subtitle" as="p" truncate>
                {activeUser.firstName} {activeUser.lastName}
              </KvTypography>
              <div className="mt-0.5">
                <KvTypography variant="overline" tone="muted" as="p" truncate>
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

interface SidebarNavLinkProps {
  item: SidebarMenuItem;
  isActive: boolean;
  isCollapsed: boolean;
  onNavigate: () => void;
}

function SidebarNavLink({ item, isActive, isCollapsed, onNavigate }: SidebarNavLinkProps) {
  const ItemIcon = resolveIcon(item.icon);

  return (
    <Link
      href={item.path}
      prefetch={false}
      onClick={onNavigate}
      className={cn(
        'flex w-full items-center rounded-xl px-3.5 py-2.5 text-xs font-bold transition-colors',
        isCollapsed ? 'justify-start lg:justify-center' : 'justify-between',
        isActive ? 'border border-brand-100/50 bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
      )}
    >
      <div className="flex items-center">
        <ItemIcon className={cn('size-4 shrink-0 text-center', isActive ? 'text-brand-600' : 'text-slate-400')} aria-hidden="true" />
        <span
          className={cn(
            'inline-block max-w-[150px] overflow-hidden whitespace-nowrap opacity-100 transition-all',
            isCollapsed ? 'ms-3 lg:ms-0 lg:max-w-0 lg:opacity-0' : 'ms-3'
          )}
        >
          {item.title}
        </span>
      </div>
    </Link>
  );
}
