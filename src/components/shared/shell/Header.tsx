'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KarvitaBrandMark } from '@/components/shared/KarvitaBrandMark';
import { KvButton } from '@/components/shared/KvButton';
import { HeaderBrandWordmark } from '@/components/shared/shell/HeaderBrandWordmark';
import { HeaderNotificationsMenu } from '@/components/shared/shell/HeaderNotificationsMenu';
import { ThemeModeToggle } from '@/components/shared/shell/ThemeModeToggle';
import { UserAccountMenu } from '@/components/shared/shell/UserAccountMenu';
import {
  kvShellHeaderPadXClassName,
  kvShellLearnerDashboardWidthClassName,
} from '@/components/shared/shell/shellChrome';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/useUIStore';
import { useUserStore } from '@/store/useUserStore';
import { getTodayJalaliFormatted } from '@/utils/formatJalaliDate';
import { faIcons } from '@/utils/iconMap';
import { getRoleStrategy, isLearnerDashboardRole } from '@/utils/RoleStrategyMap';

export function Header() {
  const activeUser = useUserStore((state) => state.activeUser);
  const isMobileSidebarOpen = useUIStore((state) => state.isMobileSidebarOpen);
  const openMobileSidebar = useUIStore((state) => state.openMobileSidebar);

  if (!activeUser) return null;

  const strategy = getRoleStrategy(activeUser.role);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-kv-border/60 bg-kv-surface/80 shadow-kv-raised backdrop-blur-md supports-[backdrop-filter]:bg-kv-surface/70">
      <div
        data-slot="kv-org-header-inner"
        className={cn(
          'flex h-16 w-full items-center justify-between',
          kvShellHeaderPadXClassName,
          isLearnerDashboardRole(activeUser.role) &&
            kvShellLearnerDashboardWidthClassName
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
            <KarvitaBrandMark />
            <HeaderBrandWordmark />
            <span className="sr-only">
              کارویتا — پنل کاربری - {strategy.label}
            </span>
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
