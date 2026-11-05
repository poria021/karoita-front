'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvTypography } from '@/components/shared/KvTypography';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { CourseMaterialsService } from '@/services/course-materials.service';
import type { InternshipCourseKind } from '@/types/internship-enrollment';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import {
  CourseMaterialFormModal,
  type CourseMaterialCourseOption,
} from './CourseMaterialFormModal';
import { CourseMaterialRow } from './CourseMaterialRow';
import { CourseMaterialsLoadError } from './CourseMaterialsLoadError';

type CourseMaterialsManagePanelProps = {
  kind: InternshipCourseKind;
  courses: CourseMaterialCourseOption[];
  activeCourse: string;
  onBack: () => void;
};

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : 'عملیات ناموفق بود. دوباره تلاش کنید.';
}

/**
 * نمای تمام‌صفحهٔ درون مسیر ارزیابی — فهرست فایل‌های منتشرشده + افزودن + بازگشت.
 */
export function CourseMaterialsManagePanel({
  kind,
  courses,
  activeCourse,
  onBack,
}: CourseMaterialsManagePanelProps) {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  const managed = useQuery({
    queryKey: DASHBOARD_QUERY.courseMaterialsManaged,
    queryFn: () => CourseMaterialsService.listManaged(),
    staleTime: QUERY_STALE_MS.list,
    retry: false,
  });

  const remove = useMutation({
    mutationFn: (id: string) => CourseMaterialsService.delete(id),
    onSuccess: async () => {
      toast.success('فایل حذف شد.');
      await queryClient.invalidateQueries({
        queryKey: DASHBOARD_QUERY.courseMaterials,
      });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const courseLabels = new Map(
    courses.map((course) => [course.value, course.label])
  );
  const rows = (managed.data ?? [])
    .filter((row) => courseLabels.has(row.courseKey))
    .map((row) => ({
      ...row,
      courseLabel: courseLabels.get(row.courseKey) || row.courseLabel,
    }));

  return (
    <div dir="rtl" className="flex flex-col gap-kv-group">
      <header className="flex flex-wrap items-center justify-between gap-kv-pair border-b border-kv-border-muted pb-kv-group">
        <div className="flex min-w-0 items-center gap-kv-inline">
          <KvButton
            type="button"
            color="neutral"
            appearance="ghost"
            size="sm"
            aria-label="بازگشت به ارزیابی گزارش‌ها"
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
              جزوه و فایل درس
            </KvTypography>
            {!managed.isError && rows.length > 0 ? (
              <KvTypography variant="caption" tone="muted" as="p">
                {toPersianDigits(String(rows.length))} فایل بارگذاری‌شده
              </KvTypography>
            ) : null}
          </div>
        </div>
        <KvButton
          type="button"
          size="sm"
          disabled={courses.length === 0}
          onClick={() => setModalOpen(true)}
          icon={<FaIcon icon={faIcons.plus} size="xs" />}
        >
          افزودن
        </KvButton>
      </header>

      <section
        aria-label="فهرست فایل‌های بارگذاری‌شده"
        className="rounded-kv-panel border border-kv-border bg-kv-surface p-kv-group shadow-kv-raised"
      >
        {managed.isError ? (
          <CourseMaterialsLoadError
            retrying={managed.isFetching}
            onRetry={() => void managed.refetch()}
          />
        ) : managed.isLoading ? (
          <KvTypography variant="caption" tone="muted" as="p">
            در حال بارگذاری فایل‌ها…
          </KvTypography>
        ) : rows.length === 0 ? (
          <KvEmptyState
            title="هنوز فایلی برای فراگیران بارگذاری نکرده‌اید."
            className="py-kv-group"
          />
        ) : (
          <ul className="flex list-none flex-col gap-kv-pair">
            {rows.map((material) => (
              <li key={material.id}>
                <CourseMaterialRow
                  material={material}
                  showCourse
                  actions={
                    <KvButton
                      type="button"
                      appearance="secondary"
                      size="sm"
                      aria-label={`حذف ${material.title}`}
                      disabled={remove.isPending}
                      onClick={() => {
                        const recordId = (
                          material.recordId ?? material.id
                        ).trim();
                        if (!recordId || recordId === 'undefined') {
                          toast.error('شناسهٔ فایل برای حذف نامعتبر است.');
                          return;
                        }
                        remove.mutate(recordId);
                      }}
                    >
                      <FaIcon icon={faIcons.trashCan} size="xs" />
                    </KvButton>
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <CourseMaterialFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        kind={kind}
        courses={courses}
        defaultCourse={activeCourse}
      />
    </div>
  );
}
