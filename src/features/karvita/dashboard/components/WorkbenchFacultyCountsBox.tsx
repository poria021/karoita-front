'use client';

import type { CSSProperties } from 'react';

import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/auth';
import { faIcons } from '@/utils/iconMap';

import { useDashboardFacultyCounts } from '../hooks/useDashboardFacultyCounts';
import { WorkbenchCountCard } from './WorkbenchCountCard';
import { workbenchErrorText } from './WorkbenchUnavailableNote';

export type WorkbenchFacultyCountsBoxProps = {
  role: UserRole;
  /** کارت‌ها زیر هم و تمام‌عرض (ستون باریک تبلیغ)؛ پیش‌فرض سه کارت کنار هم. */
  stacked?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * «آمار دانشکده» — میز کار مدیر دانشکده: تعداد اساتید، فراگیران و مدارس.
 */
export function WorkbenchFacultyCountsBox({
  role,
  stacked = false,
  className,
  style,
}: WorkbenchFacultyCountsBoxProps) {
  const { isLoading, isError, isForbidden, counts } = useDashboardFacultyCounts(role);
  const provincial = role === 'provincial_university';
  const scopeLabel = provincial ? 'دانشگاه' : 'دانشکده';

  return (
    <section
      aria-label={`آمار ${scopeLabel}`}
      aria-busy={isLoading}
      style={style}
      className={cn(
        'grid min-h-0 gap-kv-group',
        stacked ? 'grid-cols-1' : 'grid-cols-3',
        className
      )}
    >
      {isLoading ? (
        [0, 1, 2].map((index) => (
          <div
            key={index}
            aria-hidden
            className="h-24 animate-pulse rounded-kv-control bg-kv-surface-muted"
          />
        ))
      ) : isError || counts == null ? (
        <div className="col-span-full flex min-h-24 items-center justify-center rounded-kv-control border border-dashed border-kv-border-strong px-2 py-3 text-center">
          <KvTypography variant="caption" tone="muted" as="p">
            {workbenchErrorText(
              isForbidden,
              `آمار ${scopeLabel} فعلاً در دسترس نیست.`
            )}
          </KvTypography>
        </div>
      ) : (
        <>
          {provincial ? (
            <>
              <WorkbenchCountCard
                icon={faIcons.university}
                label="دانشکده‌ها"
                value={counts.faculties ?? 0}
                atLeast={counts.truncated}
              />
              <WorkbenchCountCard
                icon={faIcons.chalkboardUser}
                label="اساتید"
                value={counts.professors}
                atLeast={counts.truncated}
              />
              <WorkbenchCountCard
                icon={faIcons.userGroup}
                label="فراگیران"
                value={counts.learners}
                atLeast={counts.truncated}
              />
            </>
          ) : (
            <>
              <WorkbenchCountCard
                icon={faIcons.university}
                label="اساتید"
                value={counts.professors}
                atLeast={counts.truncated}
              />
              <WorkbenchCountCard
                icon={faIcons.userGroup}
                label="فراگیران"
                value={counts.learners}
                atLeast={counts.truncated}
              />
              <WorkbenchCountCard
                icon={faIcons.school}
                label="مدارس"
                value={counts.schools}
                atLeast={counts.truncated}
              />
            </>
          )}
        </>
      )}
    </section>
  );
}
