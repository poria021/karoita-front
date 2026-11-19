'use client';

import type { CSSProperties } from 'react';

import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { kvScrollAreaClassName } from '@/components/shared/KvScrollArea';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { workbenchBoxToneClass } from '@/lib/workbench-grid';
import type { UserRole } from '@/types/auth';
import { toPersianDigits } from '@/utils/persianDigits';

import { useDashboardStudentGradesList } from '../hooks/useDashboardStudentGradesList';
import type { StudentGradeListItem } from '../lib/student-grades-list';
import { WorkbenchUnavailableNote } from './WorkbenchUnavailableNote';

export type WorkbenchStudentGradesCardProps = {
  role: UserRole;
  className?: string;
  style?: CSSProperties;
};

function GradeRow({ item }: { item: StudentGradeListItem }) {
  return (
    <li className="flex items-center gap-kv-inline py-1.5">
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-start">
        <span className="truncate text-xs font-bold leading-tight text-kv-text">
          {item.traineeName}
        </span>
        <span className="truncate text-[11px] leading-tight text-kv-text-muted">
          {item.courseTitle}
        </span>
      </span>
      {item.grade === null ? (
        <span className="shrink-0 text-[11px] text-kv-text-faint">
          بدون نمره
        </span>
      ) : (
        <span className="shrink-0 font-sans text-sm font-black leading-none tabular-nums text-kv-text">
          {toPersianDigits(item.grade)}
        </span>
      )}
    </li>
  );
}

/**
 * کارت «نمرات فراگیران» میز کار استاد راهنما / معلم راهنما / مدیر مدرسه: نمرهٔ نهایی
 * (از ۲۰) همهٔ فراگیران همان نقش در یک فهرست قابل‌اسکرول؛ زیر آخرین باکسِ ستونِ تعداد
 * (هم‌ستون، هم‌عرض).
 */
export function WorkbenchStudentGradesCard({
  role,
  className,
  style,
}: WorkbenchStudentGradesCardProps) {
  const { isLoading, isError, isForbidden, items } = useDashboardStudentGradesList(role);
  const isEmpty = isError || (!isLoading && items.length === 0);
  // مدیر مدرسه: همین کارت با عنوان «عملکرد مدرسه».
  const title = role === 'school_principal' ? 'عملکرد مدرسه' : 'نمرات فراگیران';

  return (
    <section
      aria-labelledby="dashboard-student-grades-card-title"
      style={style}
      className={cn(
        'relative flex h-full min-h-[18rem] min-w-0 flex-col gap-kv-pair overflow-hidden rounded-kv-shell border px-kv-group py-kv-group',
        workbenchBoxToneClass(isEmpty),
        className
      )}
    >
      {/* تایتل سمت شروع (راست)، «از ۲۰» سمت پایان (چپ) هم‌ردیف تایتل. */}
      <header className="flex shrink-0 items-center justify-between gap-kv-inline">
        <KvTypography
          variant="subtitle"
          as="h3"
          id="dashboard-student-grades-card-title"
          className="min-w-0 truncate"
        >
          {title}
        </KvTypography>
        <KvTypography
          variant="caption"
          tone="muted"
          as="span"
          className="shrink-0"
        >
          از ۲۰
        </KvTypography>
      </header>

      {isError ? (
        <WorkbenchUnavailableNote forbidden={isForbidden} />
      ) : isLoading ? (
        <div
          role="status"
          aria-label="در حال بارگذاری نمرات فراگیران"
          className="min-h-0 flex-1 animate-pulse rounded-kv-control bg-kv-surface-muted"
        />
      ) : items.length === 0 ? (
        <KvEmptyState
          title="هنوز فراگیری برای شما ثبت نشده است."
          className="min-h-0 flex-1"
        />
      ) : (
        <ul
          aria-label="نمرهٔ نهایی فراگیران"
          className={cn(
            'max-h-[22rem] min-h-0 list-none divide-y divide-kv-border-muted overflow-y-auto',
            kvScrollAreaClassName
          )}
        >
          {items.map((item) => (
            <GradeRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}
