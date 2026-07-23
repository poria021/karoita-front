'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { HeaderNotificationsMenu } from '@/components/shared/shell/HeaderNotificationsMenu';
import { ThemeModeToggle } from '@/components/shared/shell/ThemeModeToggle';
import { UserAccountMenu } from '@/components/shared/shell/UserAccountMenu';
import { kvShellHeaderPadXClassName } from '@/components/shared/shell/shellChrome';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/useUIStore';
import { useUserStore } from '@/store/useUserStore';
import { getTodayJalaliFormatted } from '@/utils/formatJalaliDate';
import { faIcons } from '@/utils/iconMap';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

export function Header() {
  const activeUser = useUserStore((state) => state.activeUser);
  const isMobileSidebarOpen = useUIStore((state) => state.isMobileSidebarOpen);
  const openMobileSidebar = useUIStore((state) => state.openMobileSidebar);

  if (!activeUser) return null;

  const strategy = getRoleStrategy(activeUser.role);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-kv-border/60 bg-kv-surface/80 shadow-kv-raised backdrop-blur-md supports-[backdrop-filter]:bg-kv-surface/70">
      <div
        className={cn(
          'flex h-16 w-full items-center justify-between',
          kvShellHeaderPadXClassName
        )}
      >
        <div className="flex min-w-0 items-center gap-kv-group">
          <KvButton
            type="button"
            color="neutral"
            appearance="ghost"
            size="md"
            onClick={openMobileSidebar}
            aria-label="باز کردن منو"
            aria-expanded={isMobileSidebarOpen}
            aria-controls="karvita-sidebar"
            className="shrink-0 bg-kv-surface-subtle text-kv-text-muted hover:bg-kv-neutral-hover/80 lg:hidden"
            icon={<FaIcon icon={faIcons.bars} size="sm" />}
          />

          <div className="flex min-w-0 items-center gap-kv-inline">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand text-kv-brand-fg shadow-kv-raised shadow-kv-brand/20"
              aria-hidden="true"
            >
              <FaIcon icon={faIcons.tableColumns} size="sm" />
            </div>
            {/* Title/subtitle only from lg — logo mark alone on mobile/tablet. */}
            <div className="hidden min-w-0 flex-col lg:flex">
              <KvTypography variant="subtitle" weight="black" as="h1" truncate>
                کارویتا
              </KvTypography>
              <div className="mt-kv-nav-tight">
                <KvTypography variant="caption" tone="muted" as="p" truncate>
                  سامانه جامع آموزش نظری و مهارتی
                </KvTypography>
              </div>
            </div>
            <h1 className="sr-only lg:hidden">
              کارویتا — پنل کاربری - {strategy.label}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-kv-pair sm:gap-kv-inline">
          <div className="hidden flex-col items-end text-start md:flex">
            <KvTypography variant="overline" tone="muted" as="span">
              <span dir="rtl">{getTodayJalaliFormatted()}</span>
            </KvTypography>
          </div>

          <span
            className="hidden h-4 w-px bg-kv-neutral-hover/80 md:inline"
            aria-hidden="true"
          />

          <ThemeModeToggle />

          <span className="h-4 w-px bg-kv-neutral-hover/80" aria-hidden="true" />

          <HeaderNotificationsMenu />

          <span className="h-4 w-px bg-kv-neutral-hover/80" aria-hidden="true" />

          <UserAccountMenu variant="header" />
        </div>
      </div>
    </header>
  );
}
