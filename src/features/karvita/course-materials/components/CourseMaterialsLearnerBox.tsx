'use client';

import { useQuery } from '@tanstack/react-query';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvTypography } from '@/components/shared/KvTypography';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { CourseMaterialsService } from '@/services/course-materials.service';
import type { InternshipCourseKind } from '@/types/internship-enrollment';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { CourseMaterialRow } from './CourseMaterialRow';

type CourseMaterialsLearnerBoxProps = {
  kind: InternshipCourseKind;
  courseKey: string;
};

/**
 * جزوه‌ها و فایل‌هایی که استاد راهنما برای این درس گذاشته — در صفحهٔ گزارش فراگیر.
 * real mode تا آمدن endpoint خطا می‌دهد؛ آن وقت باکس بی‌صدا پنهان می‌ماند.
 */
export function CourseMaterialsLearnerBox({
  kind,
  courseKey,
}: CourseMaterialsLearnerBoxProps) {
  const query = useQuery({
    queryKey: [...DASHBOARD_QUERY.courseMaterialsReceived, kind, courseKey],
    queryFn: () => CourseMaterialsService.listReceived(kind, courseKey),
    staleTime: QUERY_STALE_MS.list,
    retry: false,
  });

  if (query.isError) return null;
  const rows = query.data ?? [];

  return (
    <section
      aria-label="جزوه‌ها و فایل‌های درس"
      className="flex flex-col gap-kv-group rounded-kv-panel border border-kv-border bg-kv-surface p-kv-group shadow-kv-raised"
    >
      <header className="flex items-center gap-kv-inline">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand-soft text-kv-brand">
          <FaIcon icon={faIcons.folderOpen} size="sm" />
        </span>
        <KvTypography variant="subtitle" as="h3">
          جزوه‌ها و فایل‌های درس
        </KvTypography>
        {rows.length > 0 ? (
          <KvTypography variant="caption" tone="muted" as="span">
            ({toPersianDigits(String(rows.length))})
          </KvTypography>
        ) : null}
      </header>
      {query.isLoading ? (
        <KvTypography variant="caption" tone="muted" as="p">
          در حال بارگذاری فایل‌ها…
        </KvTypography>
      ) : rows.length === 0 ? (
        <KvTypography variant="body" tone="muted" as="p">
          هنوز فایلی برای این درس بارگذاری نشده است.
        </KvTypography>
      ) : (
        <ul className="flex max-h-80 list-none flex-col gap-kv-pair overflow-y-auto">
          {rows.map((material) => (
            <li key={material.id}>
              <CourseMaterialRow material={material} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
