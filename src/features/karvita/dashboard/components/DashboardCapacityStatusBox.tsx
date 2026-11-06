'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import { KvTypography } from '@/components/shared/KvTypography';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { RouteService } from '@/services/route.service';
import { toPersianDigits } from '@/utils/persianDigits';

import { useDashboardCapacityStatus } from '../hooks/useDashboardCapacityStatus';
import {
  type CapacityFillTone,
  type CapacityKindStatusView,
} from '../lib/capacity-status';

type DashboardCapacityStatusBoxProps = {
  className?: string;
  style?: CSSProperties;
};

function formatCount(value: number | 'unlimited'): string {
  if (value === 'unlimited') return 'نامحدود';
  return toPersianDigits(value);
}

function toneTextClass(tone: CapacityFillTone): string {
  if (tone === 'critical') return 'text-kv-danger';
  if (tone === 'watch') return 'text-kv-warning';
  if (tone === 'calm') return 'text-kv-success';
  return 'text-kv-brand';
}

function toneTrackClass(tone: CapacityFillTone): string {
  if (tone === 'critical') return 'bg-kv-danger';
  if (tone === 'watch') return 'bg-kv-warning';
  if (tone === 'calm') return 'bg-kv-success';
  return 'bg-kv-brand';
}

function CompactKindRow({ view }: { view: CapacityKindStatusView }) {
  const widthPercent =
    view.fillPercent == null ? 6 : Math.max(6, view.fillPercent);

  return (
    <div className="min-w-0" aria-label={`ظرفیت ${view.label}`}>
      <div className="flex items-baseline justify-between gap-kv-inline">
        <KvTypography
          variant="caption"
          as="p"
          className="truncate font-bold text-kv-text"
        >
          {view.label}
        </KvTypography>
        <p
          className={cn(
            'shrink-0 font-sans text-sm font-black tabular-nums leading-none',
            toneTextClass(view.tone)
          )}
        >
          {view.fillPercent == null
            ? '—'
            : `${toPersianDigits(view.fillPercent)}٪`}
        </p>
      </div>

      <div
        className="relative mt-1.5 h-1.5 overflow-hidden rounded-kv-control bg-kv-surface-muted"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={view.fillPercent ?? undefined}
        aria-label={`درصد اشغال ${view.label}`}
      >
        <div
          className={cn(
            'absolute inset-y-0 start-0 rounded-kv-control transition-[width] duration-700 ease-out',
            toneTrackClass(view.tone)
          )}
          style={{ width: `${widthPercent}%` }}
        />
      </div>

      <KvTypography
        variant="caption"
        tone="muted"
        as="p"
        className="mt-1 truncate text-[11px] font-medium"
      >
        قطعی {formatCount(view.confirmed)}
        <span className="mx-1 text-kv-border-strong" aria-hidden>
          ·
        </span>
        باقی {formatCount(view.remaining)}
      </KvTypography>
    </div>
  );
}

/**
 * باکس فشردهٔ وضعیت ظرفیت — فقط میز کار استاد راهنما، کنار اطلاعیه‌ها.
 */
export function DashboardCapacityStatusBox({
  className,
  style,
}: DashboardCapacityStatusBoxProps) {
  const { isLoading, isError, views, insight } = useDashboardCapacityStatus();
  const href = RouteService.karvita.organizationalCapacities();

  return (
    <section
      aria-labelledby="dashboard-capacity-status-title"
      style={style}
      className={cn(
        'flex min-h-0 flex-col gap-kv-group overflow-hidden rounded-kv-shell border border-kv-border/70 bg-kv-surface p-kv-group shadow-kv-soft',
        className
      )}
    >
      <header className="flex shrink-0 items-center gap-kv-inline">
        <KvTypography
          variant="subtitle"
          as="h3"
          id="dashboard-capacity-status-title"
          className="min-w-0 flex-1 truncate"
        >
          وضعیت ظرفیت
        </KvTypography>
        <Link
          href={href}
          prefetch
          className="shrink-0 text-[11px] font-bold text-kv-brand hover:text-kv-brand-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20"
        >
          تعیین ظرفیت
        </Link>
      </header>

      {isLoading ? (
        <div
          role="status"
          aria-label="در حال بارگذاری وضعیت ظرفیت"
          className="flex min-h-0 flex-1 items-center justify-center"
        >
          <Spinner className="size-4 text-kv-brand" aria-hidden="true" />
        </div>
      ) : isError ? (
        <KvTypography
          variant="caption"
          tone="muted"
          as="p"
          className="leading-relaxed"
        >
          فعلاً در دسترس نیست.
        </KvTypography>
      ) : views.length === 0 ? (
        <KvTypography
          variant="caption"
          tone="muted"
          as="p"
          className="leading-relaxed"
        >
          ترم فعالی برای ظرفیت نیست.
        </KvTypography>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-kv-group overflow-hidden">
          {insight.headline ? (
            <p
              className={cn(
                'line-clamp-1 shrink-0 text-xs font-bold leading-snug',
                toneTextClass(insight.tone)
              )}
            >
              {insight.headline}
            </p>
          ) : null}
          <div className="flex min-h-0 flex-col justify-center gap-kv-group overflow-hidden">
            {views.map((view) => (
              <CompactKindRow key={view.kind} view={view} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
