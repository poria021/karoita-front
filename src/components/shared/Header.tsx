'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvConfirmationDialog } from '@/components/shared/KvConfirmationDialog';
import {
  KvDropdownMenu,
  KvDropdownMenuContent,
  KvDropdownMenuTrigger,
} from '@/components/shared/KvDropdownMenu';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { AuthService } from '@/services/auth.service';
import { RouteService } from '@/services/route.service';
import { useNotificationsStore } from '@/store/useNotificationsStore';
import { useUIStore } from '@/store/useUIStore';
import { useUserStore } from '@/store/useUserStore';
import { getTodayJalaliFormatted } from '@/utils/formatJalaliDate';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

/**
 * Global authenticated top bar (rule 00, #6): rendered once by the domain's
 * `(dashboard)` layout, never re-mounted per page. Owns the mobile sidebar
 * toggle, the notifications dropdown, and the logout action.
 */
export function Header() {
  const router = useRouter();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const activeUser = useUserStore((state) => state.activeUser);
  const openMobileSidebar = useUIStore((state) => state.openMobileSidebar);
  const notifications = useNotificationsStore((state) => state.notifications);
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);

  if (!activeUser) return null;

  const strategy = getRoleStrategy(activeUser.role);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const handleConfirmLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      await AuthService.logout();
      setIsLogoutDialogOpen(false);
      router.replace(RouteService.auth.login());
    } catch {
      setLogoutError('خروج با خطا مواجه شد. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCloseLogoutDialog = () => {
    if (isLoggingOut) return;
    setLogoutError(null);
    setIsLogoutDialogOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-kv-border/60 bg-kv-surface shadow-kv-raised">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-6 xl:px-8 2xl:px-16">
        <div className="flex min-w-0 items-center gap-kv-group">
          <button
            type="button"
            onClick={openMobileSidebar}
            aria-label="باز کردن منو"
            aria-expanded={false}
            aria-controls="karvita-sidebar"
            className="flex size-11 shrink-0 items-center justify-center rounded-kv-control bg-kv-surface-subtle text-kv-text-muted transition-all hover:bg-kv-neutral-hover/80 focus-visible:ring-[3px] focus-visible:ring-kv-ring/20 active:scale-95 lg:hidden"
          >
            <FaIcon icon={faIcons.bars} size="sm" />
          </button>

          <div className="flex min-w-0 items-center gap-kv-inline">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand text-kv-brand-fg shadow-kv-raised shadow-kv-brand/20">
              <FaIcon icon={faIcons.tableColumns} size="sm" />
            </div>
            <div className="flex min-w-0 flex-col">
              <KvTypography variant="title" as="h1" truncate>
                پنل کاربری - {strategy.label}
              </KvTypography>
              <div className="mt-1 hidden sm:block">
                <KvTypography variant="overline" tone="muted" as="p" truncate>
                  سامانه جامع آموزش نظری و مهارتی کارویتا
                </KvTypography>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-kv-pair sm:gap-kv-inline">
          <div className="hidden flex-col items-end text-start md:flex">
            <KvTypography variant="overline" tone="muted" as="span">
              {getTodayJalaliFormatted()}
            </KvTypography>
          </div>

          <span className="hidden h-4 w-px bg-kv-neutral-hover/80 md:inline" aria-hidden="true" />

          <KvDropdownMenu>
            <KvDropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={
                  unreadCount > 0
                    ? `اعلان‌ها، ${toPersianDigits(unreadCount)} خوانده‌نشده`
                    : 'اعلان‌ها'
                }
                className="relative flex size-11 items-center justify-center rounded-kv-control text-kv-text-subtle transition-colors hover:bg-kv-surface-subtle/60 hover:text-kv-text-secondary focus-visible:ring-[3px] focus-visible:ring-kv-ring/20"
              >
                <FaIcon icon={faIcons.bell} size="sm" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 start-2 size-2.5 rounded-full bg-kv-danger ring-2 ring-kv-surface" aria-hidden="true" />
                )}
              </button>
            </KvDropdownMenuTrigger>

            <KvDropdownMenuContent
              align="end"
              className="w-80 rounded-kv-panel border border-kv-border-strong/80 p-0 shadow-kv-overlay"
            >
              <div className="flex items-center justify-between border-b border-kv-border-muted px-4 py-3">
                <KvTypography variant="subtitle" as="span">
                  اعلان‌های سیستم
                </KvTypography>
                {unreadCount > 0 && (
                  <KvButton
                    type="button"
                    color="cta"
                    appearance="text"
                    size="sm"
                    onClick={markAllAsRead}
                  >
                    علامت‌گذاری همه
                  </KvButton>
                )}
              </div>

              <div className="max-h-72 divide-y divide-kv-border-muted overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-6 py-10 text-center">
                    <KvTypography variant="subtitle" as="p">
                      صندوق اعلان‌ها خالی است
                    </KvTypography>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      type="button"
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={cn(
                        'min-h-11 w-full p-4 text-start transition-colors hover:bg-kv-surface-muted focus-visible:bg-kv-surface-muted focus-visible:outline-none',
                        !notification.read && 'bg-kv-brand-soft/20'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <KvTypography variant="subtitle" as="p" truncate>
                          {notification.title}
                        </KvTypography>
                        <span className="shrink-0">
                          <KvTypography variant="overline" tone="muted" as="span">
                            {toPersianDigits(notification.time)}
                          </KvTypography>
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </KvDropdownMenuContent>
          </KvDropdownMenu>

          <span className="h-4 w-px bg-kv-neutral-hover/80" aria-hidden="true" />

          <KvButton
            type="button"
            color="error"
            appearance="text"
            icon={<FaIcon icon={faIcons.rightFromBracket} size="sm" />}
            iconPosition="end"
            onClick={() => setIsLogoutDialogOpen(true)}
            aria-label="خروج از حساب"
          >
            <span className="hidden sm:inline">خروج</span>
          </KvButton>
        </div>
      </div>

      <KvConfirmationDialog
        isOpen={isLogoutDialogOpen}
        onClose={handleCloseLogoutDialog}
        onConfirm={handleConfirmLogout}
        title="خروج از حساب کاربری"
        description="آیا مایلید به طور کامل از حساب کاربری خود در سامانه کارویتا خارج شوید؟"
        confirmText="خروج از حساب"
        cancelText="انصراف"
        confirmVariant="destructive"
        confirmDisabled={isLoggingOut}
      >
        {logoutError ? (
          <p role="alert" className="text-xs font-bold text-kv-danger">
            {logoutError}
          </p>
        ) : null}
      </KvConfirmationDialog>
    </header>
  );
}
