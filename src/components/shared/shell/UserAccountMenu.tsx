'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvConfirmationDialog } from '@/components/shared/KvConfirmationDialog';
import {
  KvDropdownMenu,
  KvDropdownMenuContent,
  KvDropdownMenuItem,
  KvDropdownMenuSeparator,
  KvDropdownMenuTrigger,
} from '@/components/shared/KvDropdownMenu';
import { KvTypography } from '@/components/shared/KvTypography';
import { ConnectivityStatusDot } from '@/components/shared/shell/ConnectivityStatusDot';
import { cn } from '@/lib/utils';
import { AuthService } from '@/services/auth.service';
import { RouteService } from '@/services/route.service';
import { useUIStore } from '@/store/useUIStore';
import { useUserStore } from '@/store/useUserStore';
import { faIcons } from '@/utils/iconMap';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

export type UserAccountMenuVariant = 'header' | 'sidebar';

export type UserAccountMenuProps = {
  variant: UserAccountMenuVariant;
  /** وقتی سایدبار موبایل باز است، بعد از رفتن به پروفایل بسته شود. */
  onNavigate?: () => void;
  /** فقط برای sidebar — حالت جمع‌شدهٔ دسکتاپ. */
  isCollapsed?: boolean;
};

function displayName(firstName: string, lastName: string, mobile: string): string {
  const full = `${firstName} ${lastName}`.trim();
  return full || mobile || 'کاربر';
}

/**
 * منوی حساب کاربر — تریگر نام + آیکن کاربر؛ گزینه‌های پروفایل و خروج.
 * در هدر و فوتر سایدبار مشترک است؛ هم‌زمان فقط یکی باز می‌ماند.
 */
export function UserAccountMenu({
  variant,
  onNavigate,
  isCollapsed = false,
}: UserAccountMenuProps) {
  const router = useRouter();
  const activeUser = useUserStore((state) => state.activeUser);
  const accountMenuOwner = useUIStore((state) => state.accountMenuOwner);
  const setAccountMenuOwner = useUIStore((state) => state.setAccountMenuOwner);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  if (!activeUser) return null;

  const strategy = getRoleStrategy(activeUser.role);
  const name = displayName(
    activeUser.firstName,
    activeUser.lastName,
    activeUser.mobile
  );
  const profileHref = RouteService.karvita.profile(activeUser.role);
  const isMenuOpen = accountMenuOwner === variant;
  const isHeader = variant === 'header';

  const handleMenuOpenChange = (open: boolean) => {
    setAccountMenuOwner(open ? variant : null);
  };

  const handleConfirmLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      await AuthService.logout();
      setIsLogoutDialogOpen(false);
      setAccountMenuOwner(null);
      onNavigate?.();
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

  const handleProfileClick = () => {
    setAccountMenuOwner(null);
    onNavigate?.();
  };

  const menuItemClass = isHeader
    ? 'gap-kv-pair justify-center px-2 py-1.5 text-xs leading-none sm:justify-start sm:px-3.5 sm:py-2.5'
    : 'gap-kv-pair';

  const menu = (
    <KvDropdownMenuContent
      align="end"
      side={variant === 'sidebar' ? 'left' : 'bottom'}
      sideOffset={variant === 'sidebar' ? 8 : 4}
      className={
        isHeader
          ? // Desktop: match chip width. Mobile: icon-only trigger is too narrow for labels.
            'w-[var(--radix-dropdown-menu-trigger-width)] min-w-[var(--radix-dropdown-menu-trigger-width)] max-sm:w-auto max-sm:min-w-[7.5rem]'
          : 'min-w-44'
      }
    >
      <KvDropdownMenuItem asChild>
        <Link
          href={profileHref}
          prefetch={false}
          onClick={handleProfileClick}
          className={cn('flex cursor-pointer items-center', menuItemClass)}
        >
          <FaIcon icon={faIcons.user} size="sm" fixedWidth />
          <span>پروفایل</span>
        </Link>
      </KvDropdownMenuItem>

      <KvDropdownMenuSeparator />

      <KvDropdownMenuItem
        variant="destructive"
        onSelect={() => {
          setAccountMenuOwner(null);
          setLogoutError(null);
          setIsLogoutDialogOpen(true);
        }}
        className={cn('flex items-center', menuItemClass)}
      >
        <FaIcon icon={faIcons.powerOff} size="sm" fixedWidth />
        <span>خروج</span>
      </KvDropdownMenuItem>
    </KvDropdownMenuContent>
  );

  const logoutDialog = (
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
  );

  if (variant === 'header') {
    return (
      <>
        <KvDropdownMenu open={isMenuOpen} onOpenChange={handleMenuOpenChange}>
          <KvDropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`منوی حساب ${name}`}
              className={cn(
                'flex h-11 max-w-[12rem] items-center gap-kv-pair rounded-kv-control px-kv-pair',
                'bg-kv-surface-subtle/60 text-kv-text',
                'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20'
              )}
            >
              <span className="relative flex size-8 shrink-0 items-center justify-center overflow-visible rounded-kv-control bg-kv-brand/10 text-kv-brand-soft-fg">
                <FaIcon icon={faIcons.user} size="sm" />
                <ConnectivityStatusDot />
              </span>
              <span className="hidden min-w-0 sm:flex sm:flex-col sm:items-start sm:text-start">
                <KvTypography variant="subtitle" as="span" truncate>
                  {name}
                </KvTypography>
              </span>
              <FaIcon
                icon={faIcons.chevronDown}
                size="2xs"
                className="hidden shrink-0 text-kv-text-faint sm:inline"
              />
            </button>
          </KvDropdownMenuTrigger>
          {menu}
        </KvDropdownMenu>
        {logoutDialog}
      </>
    );
  }

  return (
    <>
      <KvDropdownMenu open={isMenuOpen} onOpenChange={handleMenuOpenChange}>
        <KvDropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`منوی حساب ${name}`}
            className={cn(
              'w-full border-t border-kv-border-muted bg-kv-surface text-start transition-colors',
              'hover:bg-kv-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kv-ring/30',
              'data-[state=open]:bg-kv-surface-muted lg:rounded-b-kv-shell',
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
              <div className="relative flex size-9 shrink-0 items-center justify-center overflow-visible rounded-kv-control bg-kv-brand/10 text-kv-brand-soft-fg">
                <FaIcon icon={faIcons.user} size="lg" />
                <ConnectivityStatusDot />
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
                  {name}
                </KvTypography>
                <KvTypography variant="caption" as="p" truncate>
                  {strategy.label}
                </KvTypography>
              </div>
            </div>
          </button>
        </KvDropdownMenuTrigger>
        {menu}
      </KvDropdownMenu>
      {logoutDialog}
    </>
  );
}
