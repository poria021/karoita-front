'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvTypography } from '@/components/shared/KvTypography';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { CourseMaterialsService } from '@/services/course-materials.service';
import { useUserStore } from '@/store/useUserStore';
import type { InternshipCourseKind } from '@/types/internship-enrollment';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { markCourseMaterialsSeen } from '../lib/learner-materials-seen';
import { CourseMaterialRow } from './CourseMaterialRow';
import { CourseMaterialsLoadError } from './CourseMaterialsLoadError';

type CourseMaterialsLearnerPanelProps = {
  kind: InternshipCourseKind;
  courseKey: string;
  onBack: () => void;
  /** بعد از علامت‌زدن دیده‌شده (برای خاموش کردن بج دکمه). */
  onSeen?: () => void;
};

/**
 * نمای تمام‌صفحهٔ جزوه‌های دریافتی فراگیر — هم‌سبک پنل مدیریت استاد راهنما، فقط خواندنی.
 */
export function CourseMaterialsLearnerPanel({
  kind,
  courseKey,
  onBack,
  onSeen,
}: CourseMaterialsLearnerPanelProps) {
  const userId = useUserStore((state) => state.activeUser?.id ?? '');
  const query = useQuery({
    queryKey: [...DASHBOARD_QUERY.courseMaterialsReceived, kind, courseKey],
    queryFn: () => CourseMaterialsService.listReceived(kind, courseKey),
    staleTime: QUERY_STALE_MS.list,
    retry: false,
  });

  const rows = query.data ?? [];
  const newestCreatedAt = rows.reduce<string | null>((max, row) => {
    if (!max || row.createdAt > max) return row.createdAt;
    return max;
  }, null);

  useEffect(() => {
    if (!query.isSuccess) return;
    markCourseMaterialsSeen(userId, courseKey, rows);
    onSeen?.();
    // فقط وقتی لیست با موفقیت آمده / جدیدترین فایل عوض شده علامت بزن.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rows از query.data می‌آید؛ fingerprint کافی است
  }, [query.isSuccess, userId, courseKey, newestCreatedAt]);

  return (
    <div dir="rtl" className="flex flex-col gap-kv-group">
      <header className="flex flex-wrap items-center justify-between gap-kv-pair border-b border-kv-border-muted pb-kv-group">
        <div className="flex min-w-0 items-center gap-kv-inline">
          <KvButton
            type="button"
            color="neutral"
            appearance="ghost"
            size="sm"
            aria-label="بازگشت به گزارش‌نویسی"
            onClick={onBack}
            icon={<FaIcon icon={faIcons.arrowRight} size="sm" />}
          >
            بازگشت
          </KvButton>
          <span
            className="hidden h-5 w-px bg-kv-border-muted sm:inline"
            aria-hidden
          />
          <span className="flex size-9 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand-soft text-kv-brand">
            <FaIcon icon={faIcons.folderOpen} size="sm" />
          </span>
          <div className="min-w-0">
            <KvTypography variant="subtitle" as="h2">
              صندوق جزوات و فایل‌های درس
            </KvTypography>
            {!query.isError && rows.length > 0 ? (
              <KvTypography variant="caption" tone="muted" as="p">
                {toPersianDigits(String(rows.length))} فایل بارگذاری‌شده
              </KvTypography>
            ) : null}
          </div>
        </div>
      </header>

      <section
        aria-label="فهرست فایل‌های بارگذاری‌شده"
        className="rounded-kv-panel border border-kv-border bg-kv-surface p-kv-group shadow-kv-raised"
      >
        {query.isError ? (
          <CourseMaterialsLoadError
            retrying={query.isFetching}
            onRetry={() => void query.refetch()}
          />
        ) : query.isLoading ? (
          <KvTypography variant="caption" tone="muted" as="p">
            در حال بارگذاری فایل‌ها…
          </KvTypography>
        ) : rows.length === 0 ? (
          <KvEmptyState
            title="هنوز فایلی برای این درس بارگذاری نشده است."
            className="py-kv-group"
          />
        ) : (
          <ul className="flex list-none flex-col gap-kv-pair">
            {rows.map((material) => (
              <li key={material.id}>
                <CourseMaterialRow material={material} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
