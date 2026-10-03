'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
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

type CourseMaterialsPublisherBoxProps = {
  kind: InternshipCourseKind;
  courses: CourseMaterialCourseOption[];
  /** فیلتر درس فعال صفحه؛ `all` یعنی انتخاب با کاربر. */
  activeCourse: string;
};

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : 'عملیات ناموفق بود. دوباره تلاش کنید.';
}

/** فهرست جزوه/فایل‌های منتشرشده + دکمهٔ افزودن (فرم در مودال) — ویژهٔ استاد راهنما. */
export function CourseMaterialsPublisherBox({
  kind,
  courses,
  activeCourse,
}: CourseMaterialsPublisherBoxProps) {
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

  // endpoint واقعی هنوز نیست؛ بخش بی‌صدا پنهان می‌ماند.
  if (managed.isError) return null;

  const rows = (managed.data ?? []).filter((row) => row.kind === kind);

  return (
    <section
      aria-label="جزوه و فایل درس"
      className="flex flex-col gap-kv-group rounded-kv-panel border border-kv-border bg-kv-surface p-kv-group shadow-kv-raised"
    >
      <header className="flex flex-wrap items-center justify-between gap-kv-pair">
        <div className="flex items-center gap-kv-inline">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand-soft text-kv-brand">
            <FaIcon icon={faIcons.folderOpen} size="sm" />
          </span>
          <KvTypography variant="subtitle" as="h3">
            جزوه و فایل درس
          </KvTypography>
          {rows.length > 0 ? (
            <KvTypography variant="caption" tone="muted" as="span">
              ({toPersianDigits(String(rows.length))})
            </KvTypography>
          ) : null}
        </div>
        <KvButton
          type="button"
          size="sm"
          disabled={courses.length === 0}
          onClick={() => setModalOpen(true)}
        >
          <FaIcon icon={faIcons.plus} size="xs" />
          افزودن
        </KvButton>
      </header>

      {rows.length > 0 ? (
        <ul className="flex max-h-72 list-none flex-col gap-kv-pair overflow-y-auto">
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
                    onClick={() => remove.mutate(material.id)}
                  >
                    <FaIcon icon={faIcons.trashCan} size="xs" />
                  </KvButton>
                }
              />
            </li>
          ))}
        </ul>
      ) : managed.isLoading ? null : (
        <KvTypography variant="caption" tone="muted" as="p">
          هنوز فایلی برای فراگیران بارگذاری نکرده‌اید.
        </KvTypography>
      )}

      <CourseMaterialFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        kind={kind}
        courses={courses}
        defaultCourse={activeCourse}
      />
    </section>
  );
}
