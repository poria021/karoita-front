'use client';

import Link from 'next/link';
import { useId, useState, type CSSProperties } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { KvButton } from '@/components/shared/KvButton';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvTypography } from '@/components/shared/KvTypography';
import { MockDataBadge } from '@/components/shared/MockDataBadge';
import { cn } from '@/lib/utils';
import { RouteService } from '@/services/route.service';
import type { OnboardingApprovalUser } from '@/types/onboarding-approvals';
import { toPersianDigits } from '@/utils/persianDigits';
import { getRoleStrategy } from '@/utils/role-strategy';

import { useDashboardOnboardingApprovals } from '../hooks/useDashboardOnboardingApprovals';
import type { OnboardingPieSegment } from '../lib/onboarding-approvals-summary';

export type WorkbenchOnboardingApprovalsBoxProps = {
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
        'flex items-center justify-between gap-2 rounded-kv-tight px-0.5 py-2.5',
        'transition-colors duration-200 can-hover:hover:bg-kv-surface-muted/60',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kv-ring'
      )}
      aria-label={`بررسی پرونده ${user.fullName}`}
    >
      <span className="min-w-0 truncate text-start font-sans text-sm font-bold leading-tight text-kv-text">
        {user.fullName}
      </span>
      <span className="shrink-0 truncate text-end font-sans text-xs leading-tight text-kv-text-muted">
        {roleProvince}
      </span>
    </Link>
  );
}

function StatusDonut({
  segments,
  total,
  activeId,
  onHover,
}: {
  segments: OnboardingPieSegment[];
  total: number;
  activeId: string | null;
  onHover: (id: string | null) => void;
}) {
  const gradientNs = useId().replace(/:/g, '');
  const chartData = segments.filter((segment) => segment.value > 0);
  const hasValues = chartData.length > 0;

  return (
    <div className="relative size-[10.5rem] shrink-0 sm:size-[12.5rem] lg:size-[14.5rem]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[16%] rounded-full bg-[radial-gradient(circle_at_50%_40%,color-mix(in_oklab,var(--kv-brand)_9%,transparent),transparent_72%)]"
      />

      <div dir="ltr" className="size-full">
        {hasValues ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {chartData.map((segment) => (
                  <linearGradient
                    key={segment.id}
                    id={`${gradientNs}-${segment.id}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={segment.color}
                      stopOpacity={1}
                    />
                    <stop
                      offset="100%"
                      stopColor={segment.color}
                      stopOpacity={0.78}
                    />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius="64%"
                outerRadius="78%"
                paddingAngle={0}
                cornerRadius={0}
                stroke="none"
                strokeWidth={0}
                isAnimationActive
                animationDuration={700}
                animationEasing="ease-out"
                onMouseLeave={() => onHover(null)}
              >
                {chartData.map((segment) => {
                  const dimmed = activeId != null && activeId !== segment.id;
                  return (
                    <Cell
                      key={segment.id}
                      fill={`url(#${gradientNs}-${segment.id})`}
                      fillOpacity={dimmed ? 0.28 : 1}
                      style={{
                        cursor: 'pointer',
                        transition: 'fill-opacity 220ms ease',
                        filter: dimmed
                          ? undefined
                          : 'drop-shadow(0 4px 10px color-mix(in oklab, var(--kv-text) 10%, transparent))',
                      }}
                      onMouseEnter={() => onHover(segment.id)}
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex size-full items-center justify-center">
            <div className="size-[70%] rounded-full border-[8px] border-kv-surface-muted sm:border-[9px] lg:border-[10px]" />
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-sans text-[1.5rem] font-black leading-none tracking-tight text-kv-text tabular-nums sm:text-[1.75rem] lg:text-[2rem]">
          {toPersianDigits(total)}
        </span>
        <span className="mt-1 text-[10px] font-bold text-kv-text-muted sm:mt-1.5 sm:text-[11px]">
          پرونده
        </span>
      </div>
    </div>
  );
}

/**
 * باکس میز کار مدیر ارشد: دونات وضعیت تأیید مدارک + آخرین پرونده‌های در انتظار.
 */
export function WorkbenchOnboardingApprovalsBox({
  className,
  style,
}: WorkbenchOnboardingApprovalsBoxProps) {
  const { isLoading, isError, summary } = useDashboardOnboardingApprovals();
  const [activeId, setActiveId] = useState<string | null>(null);
  const pageHref = RouteService.karvita.onboardingApprovals('pending_admin');

  return (
    <section
      aria-labelledby="dashboard-onboarding-approvals-title"
      style={style}
      className={cn(
        'flex min-h-0 flex-col gap-kv-pair overflow-hidden rounded-kv-shell border border-kv-border/70 bg-kv-surface px-kv-group py-kv-group shadow-kv-soft',
        className
      )}
    >
      <header className="flex shrink-0 items-center gap-kv-inline">
        <div className="flex min-w-0 flex-1 items-center gap-kv-pair">
          <KvTypography
            variant="subtitle"
            as="h3"
            id="dashboard-onboarding-approvals-title"
            className="min-w-0 truncate"
          >
            وضعیت پرونده‌ها
          </KvTypography>
          <MockDataBadge />
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
        <KvTypography variant="caption" tone="muted" as="p">
          فعلاً در دسترس نیست.
        </KvTypography>
      ) : isLoading ? (
        <div
          role="status"
          aria-label="در حال بارگذاری وضعیت پرونده‌ها"
          className="min-h-0 flex-1 animate-pulse rounded-kv-control bg-kv-surface-muted"
        />
      ) : (
        <div className="grid min-h-0 w-max max-w-full grid-cols-1 overflow-hidden sm:grid-cols-[minmax(16rem,max-content)_auto] sm:items-start">
          {/* RTL: ستون اول راست = لیست؛ ستون دوم چپ = نمودار + راهنما */}
          <aside
            aria-label="آخرین کاربران در انتظار بررسی"
            className="order-2 min-h-0 min-w-0 w-[18rem] max-w-full overflow-hidden sm:order-1 sm:pe-4"
          >
            {summary.pendingPreview.length === 0 ? (
              <KvEmptyState
                title="فعلاً پرونده‌ای در صف بررسی نیست."
                className="min-h-0 py-1"
              />
            ) : (
              <ul className="flex min-h-0 list-none flex-col divide-y divide-kv-border-muted overflow-y-auto [scrollbar-width:thin]">
                {summary.pendingPreview.map((user) => (
                  <li key={user.id}>
                    <PendingUserRow user={user} />
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <div className="order-1 flex min-h-0 min-w-0 flex-col items-center gap-2 border-t border-kv-border pt-2 sm:order-2 sm:self-start sm:border-s sm:border-t-0 sm:flex-row sm:items-center sm:gap-2 sm:ps-2 sm:pt-0 sm:pb-0">
            <StatusDonut
              segments={summary.segments}
              total={summary.total}
              activeId={activeId}
              onHover={setActiveId}
            />

            <ul
              className="grid w-full min-w-0 gap-0.5 sm:max-w-[9rem]"
              aria-label="راهنمای وضعیت پرونده‌ها"
            >
              {summary.segments.map((segment) => {
                const active = activeId === segment.id;
                const muted = activeId != null && !active;
                return (
                  <li key={segment.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveId(active ? null : segment.id)
                      }
                      onMouseEnter={() => setActiveId(segment.id)}
                      onMouseLeave={() => setActiveId(null)}
                      aria-pressed={active}
                      className={cn(
                        'flex w-full items-center gap-1.5 rounded-kv-control px-1.5 py-1 text-start transition-[background-color,opacity] duration-200',
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
                          'shrink-0 font-sans text-sm font-black tabular-nums',
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
        </div>
      )}
    </section>
  );
}
