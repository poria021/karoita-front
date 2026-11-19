'use client';

import type { CSSProperties } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/auth';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { useDashboardLearnerCounts } from '../hooks/useDashboardLearnerCounts';
import { WorkbenchCountCard } from './WorkbenchCountCard';
import { workbenchErrorText } from './WorkbenchUnavailableNote';

export type WorkbenchLearnerCountsBoxProps = {
  role: UserRole;
  /** کارت‌ها زیر هم و تمام‌عرض (ستون باریک تبلیغ)؛ پیش‌فرض کنار هم. */
  stacked?: boolean;
  className?: string;
  style?: CSSProperties;
};

/** یک کارت «فراگیران»: مجموع بزرگ، و زیرش تفکیک دانشجو / مهارت‌آموز. */
function LearnersCard({
  students,
  skillLearners,
  atLeast,
}: {
  students: number;
  skillLearners: number;
  atLeast: boolean;
}) {
  const total = students + skillLearners;
  const plus = atLeast ? '+' : '';
  return (
    <div
      role="group"
      aria-label={`فراگیران: ${toPersianDigits(total)}${atLeast ? ' یا بیشتر' : ''}؛ دانشجویان ${toPersianDigits(students)}، مهارت‌آموزان ${toPersianDigits(skillLearners)}`}
      className="flex min-h-0 min-w-0 flex-col items-center justify-center gap-1 rounded-kv-control border border-kv-border/50 bg-kv-surface-muted/40 px-2 py-2 text-center"
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-kv-control bg-kv-surface text-kv-brand">
        <FaIcon icon={faIcons.userGroup} size="sm" aria-hidden />
      </span>
      <p className="line-clamp-1 w-full text-[11px] font-medium leading-snug text-kv-text-muted">
        فراگیران
      </p>
      <p className="font-sans text-2xl font-black tabular-nums leading-none tracking-tight text-kv-text">
        {toPersianDigits(total)}
        {plus}
      </p>
      <div className="mt-1 grid w-full grid-cols-2 divide-x divide-kv-border/50 border-t border-kv-border/50 pt-2">
        <div className="flex min-w-0 flex-col items-center gap-0.5">
          <span className="line-clamp-1 w-full text-[10px] font-medium leading-snug text-kv-text-muted">
            دانشجویان
          </span>
          <span className="font-sans text-sm font-black tabular-nums leading-none text-kv-text">
            {toPersianDigits(students)}
            {plus}
          </span>
        </div>
        <div className="flex min-w-0 flex-col items-center gap-0.5">
          <span className="line-clamp-1 w-full text-[10px] font-medium leading-snug text-kv-text-muted">
            مهارت‌آموزان
          </span>
          <span className="font-sans text-sm font-black tabular-nums leading-none text-kv-text">
            {toPersianDigits(skillLearners)}
            {plus}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * «تعداد فراگیران» — بدون باکس دورش؛ یک کارت «فراگیران» (مجموع + تفکیک دانشجو /
 * مهارت‌آموز) با همان استایل کارت‌های شمارندهٔ میز کار. مدیر مدرسه کارت «معلمان» را
 * هم کنارش (در ستون تبلیغ: زیرش) دارد.
 * استاد راهنما، معلم راهنما و مدیر مدرسه هر کدام فراگیران خودشان را می‌بینند.
 */
export function WorkbenchLearnerCountsBox({
  role,
  stacked = false,
  className,
  style,
}: WorkbenchLearnerCountsBoxProps) {
  const { isLoading, isError, isForbidden, counts } = useDashboardLearnerCounts(role);
  // مدیر مدرسه: «معلمان» بالای «فراگیران».
  const showTeachers = role === 'school_principal';

  return (
    <section
      aria-label="تعداد فراگیران"
      aria-busy={isLoading}
      style={style}
      className={cn(
        'grid min-h-0 gap-kv-group',
        stacked || !showTeachers ? 'grid-cols-1' : 'grid-cols-2',
        className
      )}
    >
      {isLoading ? (
        <>
          {showTeachers ? (
            <div
              aria-hidden
              className="h-24 animate-pulse rounded-kv-control bg-kv-surface-muted"
            />
          ) : null}
          <div
            aria-hidden
            className="h-32 animate-pulse rounded-kv-control bg-kv-surface-muted"
          />
        </>
      ) : isError || counts == null ? (
        <div className="col-span-full flex min-h-24 items-center justify-center rounded-kv-control border border-dashed border-kv-border-strong px-2 py-3 text-center">
          <KvTypography variant="caption" tone="muted" as="p">
            {workbenchErrorText(isForbidden, 'تعداد فراگیران فعلاً در دسترس نیست.')}
          </KvTypography>
        </div>
      ) : (
        <>
          {showTeachers ? (
            <WorkbenchCountCard
              icon={faIcons.userTie}
              label="معلمان"
              value={counts.teachers}
              atLeast={counts.truncated}
            />
          ) : null}
          <LearnersCard
            students={counts.students}
            skillLearners={counts.skillLearners}
            atLeast={counts.truncated}
          />
        </>
      )}
    </section>
  );
}
