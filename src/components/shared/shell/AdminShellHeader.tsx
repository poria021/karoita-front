'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { HeaderNotificationsMenu } from '@/components/shared/shell/HeaderNotificationsMenu';
import { ThemeModeToggle } from '@/components/shared/shell/ThemeModeToggle';
import { UserAccountMenu } from '@/components/shared/shell/UserAccountMenu';
import { kvShellAdminHeaderPadXClassName } from '@/components/shared/shell/shellChrome';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/useUIStore';
import { getTodayJalaliFormatted } from '@/utils/formatJalaliDate';
import { faIcons } from '@/utils/iconMap';

/**
 * Staff-admin header — brand lives on AdminSidebar, so this bar only
 * carries actions. Width is the remaining column (parent applies rail
 * clearance); it meets the rail and does not run under it.
 */
export function AdminShellHeader() {
  const isMobileSidebarOpen = useUIStore((state) => state.isMobileSidebarOpen);
  const openMobileSidebar = useUIStore((state) => state.openMobileSidebar);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-kv-border/60 bg-kv-surface/80 shadow-kv-raised backdrop-blur-md supports-[backdrop-filter]:bg-kv-surface/70">
      <div
        className={cn(
          'flex h-16 w-full items-center justify-between',
          kvShellAdminHeaderPadXClassName
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
            aria-controls="karvita-admin-sidebar"
            className="shrink-0 bg-kv-surface-subtle text-kv-text-muted hover:bg-kv-neutral-hover/80 lg:hidden"
            icon={<FaIcon icon={faIcons.bars} size="sm" />}
          />
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
