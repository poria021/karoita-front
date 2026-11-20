'use client';

import Link from 'next/link';
import { useState, type CSSProperties } from 'react';

import { KvButton } from '@/components/shared/KvButton';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { workbenchBoxToneClass } from '@/lib/workbench-grid';
import { RouteService } from '@/services/route.service';
import type { OnboardingApprovalUser } from '@/types/onboarding-approvals';
import { toPersianDigits } from '@/utils/persianDigits';
import { getRoleStrategy } from '@/utils/role-strategy';

import { useDashboardDocumentsStatus } from '../hooks/useDashboardDocumentsStatus';
import { useDashboardOnboardingApprovals } from '../hooks/useDashboardOnboardingApprovals';
import { StatusDonut } from './StatusDonut';
import { WorkbenchBoxBusy } from './WorkbenchBoxBusy';
import { WorkbenchUnavailableNote } from './WorkbenchUnavailableNote';

export type WorkbenchOnboardingBoxProps = {
  className?: string;
  style?: CSSProperties;
};

function PendingUserRow({ user }: { user: OnboardingApprovalUser }) {
  const roleProvince = [
    getRoleStrategy(user.role).label,
    user.province?.[0],
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link
      href={RouteService.karvita.onboardingApprovals('pending_admin')}
      prefetch
      className={cn(
        'flex items-center gap-kv-pair rounded-kv-control px-1 py-2',
        'transition-colors duration-200 can-hover:hover:bg-kv-surface-muted/60',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kv-ring'
      )}
      aria-label={`بررسی پرونده ${user.fullName}`}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-start">
        <span className="truncate font-sans text-sm font-bold leading-tight text-kv-text">
          {user.fullName}
        </span>
        <span className="truncate text-[11px] leading-tight text-kv-text-muted">
          {roleProvince || '—'}
        </span>
      </span>
    </Link>
  );
}

/**
 * باکس صف بررسی میز کار ادمین: ۱۰ کاربر آخرِ در انتظار تأیید مدارک.
 */
export function WorkbenchPendingQueueBox({
  className,
  style,
}: WorkbenchOnboardingBoxProps) {
  const { isLoading, isError, isForbidden, summary } = useDashboardOnboardingApprovals();
  const pageHref = RouteService.karvita.onboardingApprovals('pending_admin');
  const isEmpty =
    isError || (!isLoading && summary.pendingPreview.length === 0);

  return (
    <section
      aria-labelledby="dashboard-pending-queue-title"
      style={style}
      className={cn(
        'relative flex h-full min-h-[22.5rem] sm:min-h-[24.5rem] lg:min-h-[26.5rem] md:absolute md:inset-0 md:h-auto md:min-h-0 lg:min-h-0 min-w-0 flex-col gap-kv-pair overflow-hidden rounded-kv-shell border px-kv-group py-kv-group',
        workbenchBoxToneClass(isEmpty),
        className
      )}
    >
      <header className="flex shrink-0 items-center gap-kv-inline">
        <div className="flex min-w-0 flex-1 flex-col">
          <KvTypography
            variant="subtitle"
            as="h3"
            id="dashboard-pending-queue-title"
            className="min-w-0 truncate"
          >
            در انتظار بررسی
          </KvTypography>
          <KvTypography variant="caption" tone="muted" as="p">
            آخرین {toPersianDigits(summary.pendingPreview.length || 10)} کاربر
            صف تأیید مدارک
          </KvTypography>
        </div>
        <KvButton
          asChild
          color="cta"
          appearance="text"
          size="xs"
          className="shrink-0 text-[11px] font-bold"
        >
          <Link href={pageHref} prefetch>
            بررسی مدارک
          </Link>
        </KvButton>
      </header>

      {isError ? (
        <WorkbenchUnavailableNote forbidden={isForbidden} />
      ) : isLoading ? (
        <WorkbenchBoxBusy label="در حال بارگذاری صف بررسی" className="min-h-0" />
      ) : summary.pendingPreview.length === 0 ? (
        <KvEmptyState
          title="فعلاً پرونده‌ای در صف بررسی نیست."
          className="min-h-0 py-1"
        />
      ) : (
        <ul
          aria-label="آخرین کاربران در انتظار بررسی"
          className="grid min-h-0 flex-1 list-none grid-cols-1 content-start divide-y divide-kv-border-muted overflow-y-auto [scrollbar-width:thin]"
        >
          {summary.pendingPreview.map((user) => (
            <li key={user.id}>
              <PendingUserRow user={user} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * باکس نمودار دایره‌ای وضعیت پرونده‌ها (در انتظار / تأییدشده / ردشده).
 * ارتفاع ثابت و کوچک دارد و به‌جای `h-full`، به‌اندازهٔ محتوای خودش می‌ایستد
 * (سلولش هم `self-start` است) تا وقتی کنار باکس‌های بلندتر قرار می‌گیرد کش نیاید.
 */
export function WorkbenchApprovalsDonutBox({
  className,
  style,
}: WorkbenchOnboardingBoxProps) {
  const { isLoading, isError, isForbidden, summary } = useDashboardDocumentsStatus();
  const [activeId, setActiveId] = useState<string | null>(null);
  const isEmpty = isError || (!isLoading && summary.total === 0);

  return (
    <section
      aria-labelledby="dashboard-approvals-donut-title"
      style={style}
      className={cn(
        'relative flex min-h-[6rem] w-fit min-w-0 max-w-full flex-col gap-kv-pair overflow-hidden rounded-kv-shell border px-kv-group py-kv-group',
        workbenchBoxToneClass(isEmpty),
        className
      )}
    >
      <header className="flex shrink-0 items-center gap-kv-inline">
        <div className="flex min-w-0 flex-1 flex-col">
          <KvTypography
            variant="subtitle"
            as="h3"
            id="dashboard-approvals-donut-title"
            className="min-w-0 truncate"
          >
            وضعیت پرونده‌ها
          </KvTypography>
          <KvTypography variant="caption" tone="muted" as="p">
            نگاه کلی به همهٔ پرونده‌های مدارک
          </KvTypography>
        </div>
      </header>

      {isError ? (
        <WorkbenchUnavailableNote forbidden={isForbidden} />
      ) : isLoading ? (
        <WorkbenchBoxBusy label="در حال بارگذاری وضعیت پرونده‌ها" />
      ) : (
        <div className="flex min-h-0 flex-row items-center justify-center gap-kv-group">
          {/* نمودار سمت راست: بقیهٔ عرض را می‌گیرد و وسط‌چین است */}
          <div className="flex min-w-0 shrink-0 items-center justify-center">
            <StatusDonut
              segments={summary.segments}
              total={summary.total}
              activeId={activeId}
              onHover={setActiveId}
            />
          </div>

          <ul
            className="grid w-fit shrink-0 gap-0.5"
            aria-label="راهنمای وضعیت پرونده‌ها"
          >
            {summary.segments.map((segment) => {
              const active = activeId === segment.id;
              const muted = activeId != null && !active;
              return (
                <li key={segment.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(active ? null : segment.id)}
                    onMouseEnter={() => setActiveId(segment.id)}
                    onMouseLeave={() => setActiveId(null)}
                    aria-pressed={active}
                    className={cn(
                      'flex w-full items-center gap-1.5 rounded-kv-control px-1.5 py-1.5 text-start transition-[background-color,opacity] duration-200',
                      'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20',
                      active
                        ? cn(segment.softClassName, 'shadow-kv-soft')
                        : 'can-hover:hover:bg-kv-surface-muted/70',
                      muted && 'opacity-40'
                    )}
                  >
                    <span
                      aria-hidden
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <span
                      className={cn(
                        'min-w-0 flex-1 truncate text-[11px] font-semibold',
                        active ? segment.textClassName : 'text-kv-text-muted'
                      )}
                    >
                      {segment.label}
                    </span>
                    <span
                      className={cn(
                        'ms-10 shrink-0 font-sans text-sm font-black tabular-nums',
                        active ? segment.textClassName : 'text-kv-text'
                      )}
                    >
                      {toPersianDigits(segment.value)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
