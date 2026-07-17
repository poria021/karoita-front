'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, LayoutDashboard, LogOut, Menu } from 'lucide-react';

import { AuthService } from '@/services/auth.service';
import { RouteService } from '@/services/route.service';
import { useUserStore } from '@/store/useUserStore';
import { useUIStore } from '@/store/useUIStore';
import { useNotificationsStore } from '@/store/useNotificationsStore';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';
import { getTodayJalaliFormatted } from '@/utils/formatJalaliDate';
import { toPersianDigits } from '@/utils/persianDigits';
import { cn } from '@/lib/utils';

import { KvButton } from '@/components/shared/KvButton';
import { KvConfirmationDialog } from '@/components/shared/KvConfirmationDialog';
import {
  KvDropdownMenu,
  KvDropdownMenuContent,
  KvDropdownMenuTrigger,
} from '@/components/shared/KvDropdownMenu';
import { KvTypography } from '@/components/shared/KvTypography';

/**
 * Global authenticated top bar (rule 00, #6): rendered once by the domain's
 * `(dashboard)` layout, never re-mounted per page. Owns the mobile sidebar
 * toggle, the notifications dropdown, and the logout action.
 */
export function Header() {
  const router = useRouter();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const activeUser = useUserStore((state) => state.activeUser);
  const openMobileSidebar = useUIStore((state) => state.openMobileSidebar);
  const notifications = useNotificationsStore((state) => state.notifications);
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);

  if (!activeUser) return null;

  const strategy = getRoleStrategy(activeUser.role);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const handleConfirmLogout = async () => {
    await AuthService.logout();
    router.push(RouteService.auth.login());
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-kv-border/60 bg-kv-surface">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-6 xl:px-8 2xl:px-16">
        <div className="flex items-center gap-kv-group">
          <button
            type="button"
            onClick={openMobileSidebar}
            aria-label="باز کردن منو"
            className="flex size-9 items-center justify-center rounded-kv-control bg-kv-surface-subtle text-kv-text-muted transition-all hover:bg-kv-neutral-hover/80 active:scale-95 lg:hidden"
          >
            <Menu className="size-4" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-kv-inline">
            <div className="flex size-9 items-center justify-center rounded-kv-control bg-kv-brand text-kv-brand-fg shadow-sm shadow-kv-brand/20">
              <LayoutDashboard className="size-4" aria-hidden="true" />
            </div>
            <div className="hidden flex-col lg:flex">
              <KvTypography variant="title" as="h1">
                پنل کاربری - {strategy.label}
              </KvTypography>
              <div className="mt-1">
                <KvTypography variant="overline" tone="muted" as="p">
                  سامانه جامع آموزش نظری و مهارتی کارویتا
                </KvTypography>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-kv-inline">
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
                aria-label="اعلان‌ها"
                className="relative flex size-9 items-center justify-center rounded-kv-control text-kv-text-subtle transition-colors hover:bg-kv-surface-subtle/60 hover:text-kv-text-secondary"
              >
                <Bell className="size-4" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 start-2 size-2.5 rounded-full bg-kv-danger ring-2 ring-kv-surface" aria-hidden="true" />
                )}
              </button>
            </KvDropdownMenuTrigger>

            <KvDropdownMenuContent align="end" className="w-80 rounded-kv-panel border border-kv-border-strong/80 p-0 shadow-xl">
              <div className="flex items-center justify-between border-b border-kv-border-muted px-4 py-3">
                <KvTypography variant="subtitle" as="span">
                  اعلان‌های سیستم
                </KvTypography>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-[10px] font-bold text-kv-brand-soft-fg hover:text-kv-brand-soft-fg"
                  >
                    علامت‌گذاری همه
                  </button>
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
                        'w-full p-4 text-start transition-colors hover:bg-kv-surface-muted',
                        !notification.read && 'bg-kv-brand-soft/20'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-bold text-kv-text-secondary">{notification.title}</p>
                        <span className="shrink-0 text-[9px] text-kv-text-faint">{toPersianDigits(notification.time)}</span>
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
            icon={<LogOut className="size-4" aria-hidden="true" />}
            iconPosition="end"
            onClick={() => setIsLogoutDialogOpen(true)}
          >
            <span className="hidden sm:inline">خروج</span>
          </KvButton>
        </div>
      </div>

      <KvConfirmationDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleConfirmLogout}
        title="خروج از حساب کاربری"
        description="آیا مایلید به طور کامل از حساب کاربری خود در سامانه کارویتا خارج شوید؟"
        confirmText="خروج از حساب"
        cancelText="انصراف"
        confirmVariant="destructive"
      />
    </header>
  );
}
