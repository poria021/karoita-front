'use client';

import type { CSSProperties } from 'react';

import { KvTypography } from '@/components/shared/KvTypography';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { workbenchBoxToneClass } from '@/lib/workbench-grid';
import type { UserRole } from '@/types/auth';
import { faIcons } from '@/utils/iconMap';

import { useDashboardLearnerCounts } from '../hooks/useDashboardLearnerCounts';
import { WorkbenchCountCard } from './WorkbenchCountCard';
import { WorkbenchUnavailableNote } from './WorkbenchUnavailableNote';

export type WorkbenchTeacherCountBoxProps = {
  role: UserRole;
  className?: string;
  style?: CSSProperties;
};

/**
 * باکس «معلمان» — فقط میز کار مدیر مدرسه. تعداد معلمان راهنمایی که دست‌کم
 * یک فراگیر فعال در این مدرسه دارند (از روی فراگیران مدرسه شمرده می‌شود).
 */
export function WorkbenchTeacherCountBox({
  role,
  className,
  style,
}: WorkbenchTeacherCountBoxProps) {
  const { isLoading, isError, isForbidden, counts } = useDashboardLearnerCounts(role);
  const isEmpty = !isLoading && (isError || counts == null);

  return (
    <section
      aria-labelledby="dashboard-teacher-count-title"
      style={style}
      className={cn(
        'flex min-h-0 flex-col gap-kv-group overflow-hidden rounded-kv-shell border p-kv-group',
        workbenchBoxToneClass(isEmpty),
        className
      )}
    >
      <header className="shrink-0">
        <KvTypography
          variant="subtitle"
          as="h3"
          id="dashboard-teacher-count-title"
          className="truncate"
        >
          معلمان
        </KvTypography>
      </header>

      {isLoading ? (
        <div
          role="status"
          aria-label="در حال بارگذاری تعداد معلمان"
          className="flex min-h-16 flex-1 items-center justify-center"
        >
          <Spinner className="size-4 text-kv-brand" aria-hidden="true" />
        </div>
      ) : isError || counts == null ? (
        <WorkbenchUnavailableNote forbidden={isForbidden} />
      ) : (
        <WorkbenchCountCard
          icon={faIcons.userTie}
          label="معلمان"
          value={counts.teachers}
          atLeast={counts.truncated}
          caption="دارای حداقل یک فراگیر فعال"
        />
      )}
    </section>
  );
}
