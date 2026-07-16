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

import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/60 bg-white">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-6 xl:px-8 2xl:px-16">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={openMobileSidebar}
            aria-label="باز کردن منو"
            className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-all hover:bg-slate-200/80 active:scale-95 lg:hidden"
          >
            <Menu className="size-4" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm shadow-brand-500/20">
              <LayoutDashboard className="size-4" aria-hidden="true" />
            </div>
            <div className="hidden flex-col lg:flex">
              <h1 className="text-xs font-black leading-tight text-slate-900 sm:text-sm">پنل کاربری - {strategy.label}</h1>
              <p className="mt-0.5 text-[9px] font-bold leading-tight text-slate-500 sm:mt-1">سامانه جامع آموزش نظری و مهارتی کارویتا</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden flex-col items-end text-start text-[9px] font-black leading-tight text-slate-400 md:flex sm:text-[10px]">
            <span>{getTodayJalaliFormatted()}</span>
          </div>

          <span className="hidden h-4 w-px bg-slate-200/80 md:inline" aria-hidden="true" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="اعلان‌ها"
                className="relative flex size-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100/60 hover:text-slate-800"
              >
                <Bell className="size-4" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 start-2 size-2.5 rounded-full bg-rose-500 ring-2 ring-white" aria-hidden="true" />
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 rounded-2xl border border-slate-300/80 p-0 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <span className="text-xs font-black text-slate-800">اعلان‌های سیستم</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-[10px] font-bold text-brand-600 hover:text-brand-700"
                  >
                    علامت‌گذاری همه
                  </button>
                )}
              </div>

              <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-6 py-10 text-center text-xs text-slate-400">
                    <p className="mb-1 font-bold text-slate-700">صندوق اعلان‌ها خالی است</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      type="button"
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={cn(
                        'w-full p-4 text-start transition-colors hover:bg-slate-50',
                        !notification.read && 'bg-brand-50/20'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-bold text-slate-800">{notification.title}</p>
                        <span className="shrink-0 text-[9px] text-slate-400">{toPersianDigits(notification.time)}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="h-4 w-px bg-slate-200/80" aria-hidden="true" />

          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsLogoutDialogOpen(true)}
            className="h-auto gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-transparent hover:text-rose-700"
          >
            <span className="hidden sm:inline">خروج</span>
            <LogOut className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <ConfirmationDialog
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
