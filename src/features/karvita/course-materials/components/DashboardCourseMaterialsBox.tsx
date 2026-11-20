'use client';

import type { CSSProperties } from 'react';

import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvTypography } from '@/components/shared/KvTypography';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { workbenchBoxToneClass } from '@/lib/workbench-grid';
import type { CourseMaterial } from '@/types/course-materials';
import { toPersianDigits } from '@/utils/persianDigits';

import { DashboardCourseMaterialCard } from './DashboardCourseMaterialCard';

type DashboardCourseMaterialsBoxProps = {
  materials: CourseMaterial[];
  /** مسیر صفحهٔ جزوه برای هر `courseKey`. */
  materialsHrefByCourseKey: ReadonlyMap<string, string>;
  isLoading: boolean;
  className?: string;
  style?: CSSProperties;
};

function CountHint({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <KvTypography
      variant="caption"
      tone="muted"
      as="span"
      className="font-medium"
    >
      ({toPersianDigits(String(count))})
    </KvTypography>
  );
}

/** باکس «جزوه‌های درسی»ی میز کار فراگیر. */
export function DashboardCourseMaterialsBox({
  materials,
  materialsHrefByCourseKey,
  isLoading,
  className,
  style,
}: DashboardCourseMaterialsBoxProps) {
  const isEmpty = !isLoading && materials.length === 0;

  return (
    <section
      aria-labelledby="dashboard-course-materials-title"
      style={style}
      className={cn(
        'flex min-h-0 flex-col gap-kv-group overflow-hidden rounded-kv-shell border p-kv-group',
        workbenchBoxToneClass(isEmpty),
        className
      )}
    >
      <header className="flex shrink-0 items-center gap-kv-inline">
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-kv-pair">
          <KvTypography
            variant="subtitle"
            as="h3"
            id="dashboard-course-materials-title"
          >
            جزوه‌های درسی
          </KvTypography>
          <CountHint count={materials.length} />
        </div>
      </header>

      {isLoading ? (
        <div
          role="status"
          aria-label="در حال بارگذاری جزوه‌ها"
          className="flex min-h-0 flex-1 items-center justify-center py-kv-pair"
        >
          <Spinner className="size-5 text-kv-brand" aria-hidden="true" />
        </div>
      ) : materials.length === 0 ? (
        <KvEmptyState
          title="فعلاً جزوه‌ای برای درس‌های این نیم‌سال نیست."
          className="min-h-0 py-kv-pair"
        />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto [direction:ltr] [scrollbar-width:thin]">
          <ul
            dir="rtl"
            className="flex list-none flex-col divide-y divide-kv-border-muted [direction:rtl]"
          >
            {materials.map((item) => (
              <li key={item.id}>
                <DashboardCourseMaterialCard
                  material={item}
                  courseHref={materialsHrefByCourseKey.get(item.courseKey)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
