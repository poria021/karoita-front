'use client';

import { useQuery } from '@tanstack/react-query';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { CourseMaterialsService } from '@/services/course-materials.service';
import type { InternshipCourseKind } from '@/types/internship-enrollment';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import type { CourseMaterialCourseOption } from './CourseMaterialFormModal';
import { CourseMaterialsLoadError } from './CourseMaterialsLoadError';

type CourseMaterialsPublisherBoxProps = {
  kind: InternshipCourseKind;
  courses: CourseMaterialCourseOption[];
  /** فیلتر درس فعال صفحه؛ برای شمارش فایل‌های همین صفحه. */
  activeCourse: string;
  /** باز کردن نمای فهرست فایل‌ها در همان مسیر ارزیابی. */
  onOpenManage: () => void;
};

/**
 * باکس خلاصه روی صفحهٔ ارزیابی — ورود به فهرست فایل‌ها (نمای جدا با دکمهٔ بازگشت).
 */
export function CourseMaterialsPublisherBox({
  courses,
  onOpenManage,
}: CourseMaterialsPublisherBoxProps) {
  const managed = useQuery({
    queryKey: DASHBOARD_QUERY.courseMaterialsManaged,
    queryFn: () => CourseMaterialsService.listManaged(),
    staleTime: QUERY_STALE_MS.list,
    retry: false,
  });

  const courseKeys = new Set(courses.map((course) => course.value));
  const count = (managed.data ?? []).filter((row) =>
    courseKeys.has(row.courseKey)
  ).length;
  const canOpen = courses.length > 0;

  return (
    <section
      aria-label="جزوه و فایل درس"
      className="flex flex-col gap-kv-group rounded-kv-panel border border-kv-border bg-kv-surface p-kv-group shadow-kv-raised"
    >
      <header className="flex flex-wrap items-center justify-between gap-kv-pair">
        <div className="flex min-w-0 items-center gap-kv-inline">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand-soft text-kv-brand">
            <FaIcon icon={faIcons.folderOpen} size="sm" />
          </span>
          <div className="min-w-0">
            <KvTypography variant="subtitle" as="h3">
              جزوه و فایل درس
            </KvTypography>
            {managed.isError ? null : managed.isLoading ? (
              <KvTypography variant="caption" tone="muted" as="p">
                در حال بارگذاری…
              </KvTypography>
            ) : count > 0 ? (
              <KvTypography variant="caption" tone="muted" as="p">
                {toPersianDigits(String(count))} فایل بارگذاری‌شده
              </KvTypography>
            ) : (
              <KvTypography variant="caption" tone="muted" as="p">
                هنوز فایلی برای فراگیران بارگذاری نکرده‌اید.
              </KvTypography>
            )}
          </div>
        </div>
        <KvButton
          type="button"
          size="sm"
          disabled={!canOpen || managed.isError}
          onClick={onOpenManage}
          icon={
            <FaIcon
              icon={count > 0 ? faIcons.folderOpen : faIcons.plus}
              size="xs"
            />
          }
        >
          {count > 0 ? 'مشاهده فایل‌ها' : 'افزودن'}
        </KvButton>
      </header>

      {managed.isError ? (
        <CourseMaterialsLoadError
          retrying={managed.isFetching}
          onRetry={() => void managed.refetch()}
        />
      ) : null}
    </section>
  );
}
