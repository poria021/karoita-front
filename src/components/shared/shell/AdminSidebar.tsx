'use client';

import { usePathname } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type PointerEvent,
} from 'react';

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
import { isAdminReportsPath } from '@/features/karvita/reports/lib/report-path';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/useUIStore';
import { useUserStore } from '@/store/useUserStore';
import {
  areKarvitaModulesUnlocked,
  getRoleStrategy,
} from '@/utils/RoleStrategyMap';
import { faIcons } from '@/utils/iconMap';

import { useSidebarMenu } from './useSidebarMenu';
import { useSidebarMobileDrawer } from './useSidebarMobileDrawer';

/**
 * ریل ستادی — روی دسکتاپ ثابت و هم‌ارتفاع ویوپورت (با اسکرول صفحه حرکت نمی‌کند)؛ موبایل دراور `fixed`.
 * برند اینجاست نه در هدر. روی گزارش‌ها ورود → جمع تا ریل دوم در کروم دیده شود.
 */
export function AdminSidebar() {
  const activeUser = useUserStore((state) => state.activeUser);
  const isStoreCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const isMobileOpen = useUIStore((state) => state.isMobileSidebarOpen);
  const toggleCollapsed = useUIStore((state) => state.toggleSidebarCollapsed);
  const setSidebarCollapsed = useUIStore((state) => state.setSidebarCollapsed);
  const closeMobileSidebar = useUIStore((state) => state.closeMobileSidebar);
  const pathname = usePathname();
  const drawerTitleId = useId();
  const drawerRef = useRef<HTMLDivElement>(null);
  const wasReportsRef = useRef(false);

  // ریل جمع‌شده روی گزارش‌ها با هاور/فوکوس موقتاً باز می‌شود (روی محتوا، بدون جابه‌جایی لایوت).
  const [peekOpen, setPeekOpen] = useState(false);
  const peekTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressPeekRef = useRef(false);
  const canPeek = isStoreCollapsed && isAdminReportsPath(pathname);
  const isPeeking = canPeek && peekOpen;
  /** حالت دیداری ریل؛ `isStoreCollapsed` فقط عرض اشغال‌شده در لایوت و دکمهٔ جمع/باز را تعیین می‌کند. */
  const isCollapsed = isStoreCollapsed && !isPeeking;

  const clearPeekTimer = useCallback(() => {
    if (peekTimerRef.current) {
      clearTimeout(peekTimerRef.current);
      peekTimerRef.current = null;
    }
  }, []);

  const schedulePeek = useCallback(
    (next: boolean, delay: number) => {
      clearPeekTimer();
      peekTimerRef.current = setTimeout(() => {
        peekTimerRef.current = null;
        setPeekOpen(next);
      }, delay);
    },
    [clearPeekTimer]
  );

  useEffect(() => clearPeekTimer, [clearPeekTimer]);

  // تأخیر کوتاه: عبور اتفاقی ماوس ریل را باز نکند و خروج کوتاه از لبه آن را نبندد.
  const handlePointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (!canPeek || event.pointerType !== 'mouse') return;
    if (suppressPeekRef.current) return;
    schedulePeek(true, 120);
  };

  const handlePointerLeave = () => {
    suppressPeekRef.current = false;
    if (!peekOpen && !peekTimerRef.current) return;
    schedulePeek(false, 200);
  };

  const handleFocusCapture = (event: FocusEvent<HTMLDivElement>) => {
    if (!canPeek) return;
    if (event.target.matches(':focus-visible')) {
      clearPeekTimer();
      setPeekOpen(true);
    }
  };

  const handleBlurCapture = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }
    schedulePeek(false, 200);
  };

  const handleToggleCollapsed = () => {
    // کاربر عمداً جمع/باز کرد؛ تا خروج ماوس از ریل، هاور دوباره آن را باز نکند.
    suppressPeekRef.current = true;
    clearPeekTimer();
    setPeekOpen(false);
    toggleCollapsed();
  };

  useSidebarMobileDrawer({
    isMobileOpen,
    drawerRef,
    onClose: closeMobileSidebar,
  });

  // ورود به گزارش‌ها → جمع کن تا ریل دوم دیده شود.
  useEffect(() => {
    const onReports = isAdminReportsPath(pathname);
    if (onReports && !wasReportsRef.current) {
      setSidebarCollapsed(true);
    }
    wasReportsRef.current = onReports;
  }, [pathname, setSidebarCollapsed]);

  const visibleMenu = useSidebarMenu(activeUser?.role);

  if (!activeUser) return null;

  const strategy = getRoleStrategy(activeUser.role);
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
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocusCapture={handleFocusCapture}
        onBlurCapture={handleBlurCapture}
        className={cn(
          'fixed inset-y-0 inset-s-0 z-50 h-dvh',
          kvShellAdminRailWidthMotionClassName,
          'lg:sticky lg:inset-auto lg:top-0 lg:z-40 lg:h-dvh lg:min-h-0 lg:shrink-0 lg:self-start lg:translate-x-0 lg:pointer-events-auto lg:visible',
          isMobileOpen
            ? 'translate-x-0'
            : 'max-lg:-translate-x-full max-lg:rtl:translate-x-full',
          !isMobileOpen && 'max-lg:pointer-events-none max-lg:invisible',
          isStoreCollapsed ? 'w-72 lg:w-24' : 'w-72 lg:w-72'
        )}
      >
        <div
          ref={drawerRef}
          id="karvita-admin-sidebar"
          role={isMobileOpen ? 'dialog' : undefined}
          aria-modal={isMobileOpen ? true : undefined}
          aria-labelledby={isMobileOpen ? drawerTitleId : undefined}
          className={cn(
            'group/sidebar flex h-full min-h-0 w-full flex-col border-e border-kv-border/80 bg-kv-surface',
            'lg:absolute lg:inset-y-0 lg:inset-s-0 lg:h-auto',
            'lg:transition-[width,box-shadow] lg:duration-500 lg:ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:lg:transition-none',
            isPeeking && 'lg:w-72 lg:shadow-kv-floating'
          )}
        >
          <div
            className={cn(
              'relative flex shrink-0 items-center justify-between gap-kv-inline border-b border-kv-border-muted p-kv-group'
            )}
          >
            <div
              className={cn(
                // مارک با margin درصدی به وسط می‌رود (قابل انیمیت)، نه با پریدن justify.
                'flex min-w-0 items-center transition-[margin-inline-start] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                isCollapsed && 'lg:ms-[calc((100%_-_2.25rem)/2)]'
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
              onClick={handleToggleCollapsed}
              aria-label={
                isStoreCollapsed ? 'باز کردن نوار کناری' : 'جمع کردن نوار کناری'
              }
              className="absolute -inset-e-2.5 top-1/2 z-20 hidden size-6 min-h-0 -translate-y-1/2 rounded-kv-control border border-kv-border/80 bg-kv-surface p-0 text-kv-text-subtle shadow-kv-soft hover:border-kv-brand hover:text-kv-brand lg:flex"
              icon={
                <FaIcon
                  icon={faIcons.chevronLeft}
                  size="xs"
                  className={cn(
                    'transition-transform',
                    kvShellAdminRailMotionClassName,
                    isStoreCollapsed
                      ? 'rotate-180 rtl:rotate-0'
                      : 'rotate-0 rtl:rotate-180'
                  )}
                />
              }
            />
          </div>

          <aside
            className={cn(
              'flex min-h-0 flex-1 flex-col overflow-y-auto',
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
              className={cn(kvScrollAreaClassName, 'kv-sidebar-scroll')}
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
