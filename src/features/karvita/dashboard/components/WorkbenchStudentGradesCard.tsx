'use client';

import type { CSSProperties } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { kvScrollAreaClassName } from '@/components/shared/KvScrollArea';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { workbenchBoxToneClass } from '@/lib/workbench-grid';
import type { UserRole } from '@/types/auth';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { useDashboardStudentGradesList } from '../hooks/useDashboardStudentGradesList';
import type { StudentGradeListItem } from '../lib/student-grades-list';
import { WorkbenchBoxBusy } from './WorkbenchBoxBusy';
import { WorkbenchUnavailableNote } from './WorkbenchUnavailableNote';

export type WorkbenchStudentGradesCardProps = {
  role: UserRole;
  className?: string;
  style?: CSSProperties;
  /**
   * ارتفاع کوتاه‌تر برای ستون تبلیغ دانشکده / منطقه — زیر تبلیغ و بالای آمار.
   */
  compact?: boolean;
};

/** به‌جای عکس کاربر: آیکونِ نوعِ فراگیر — همان استایل باکس‌های لیستی ضعیف/قوی. */
function TraineeIcon({ kind }: { kind: StudentGradeListItem['kind'] }) {
  const isApprenticeship = kind === 'apprenticeship';
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full',
        isApprenticeship
          ? 'bg-kv-success-soft text-kv-success-soft-fg'
          : 'bg-kv-brand-soft text-kv-brand-soft-fg'
      )}
    >
      <FaIcon
        icon={isApprenticeship ? faIcons.briefcase : faIcons.graduationCap}
        size="sm"
      />
    </span>
  );
}

function GradeRow({ item }: { item: StudentGradeListItem }) {
  return (
    <li className="flex items-center gap-kv-pair py-1.5">
      <TraineeIcon kind={item.kind} />
      <span className="flex min-w-0 flex-1 flex-col gap-1 text-start">
        <span className="truncate text-sm font-bold leading-tight text-kv-text">
          {item.traineeName}
        </span>
        <span className="truncate text-xs leading-tight text-kv-text-muted">
          {item.courseTitle}
        </span>
      </span>
      {item.grade === null ? (
        <span className="shrink-0 text-[11px] leading-none text-kv-text-faint">
          بدون نمره
        </span>
      ) : (
        <span className="flex shrink-0 flex-col items-end gap-1">
          <span className="font-sans text-base font-black leading-none tabular-nums text-kv-text">
            {toPersianDigits(item.grade)}
          </span>
          <span className="text-[11px] leading-none text-kv-text-faint">
            از ۲۰
          </span>
        </span>
      )}
    </li>
  );
}

/**
 * کارت نمرات میز کار (عنوان بر اساس سطح پنل: دانشکده / منطقه / استان / فراگیران):
 * نمرهٔ نهایی (از ۲۰) در فهرست قابل‌اسکرول؛ با تبلیغ زیر خودِ تبلیغ، بدون تبلیغ
 * زیر ستون تعداد. ردیف‌ها هم‌استایل باکس‌های لیستی ضعیف/قوی.
 */
export function WorkbenchStudentGradesCard({
  role,
  className,
  style,
  compact = false,
}: WorkbenchStudentGradesCardProps) {
  const { isLoading, isError, isForbidden, items } =
    useDashboardStudentGradesList(role);
  const isEmpty = isError || (!isLoading && items.length === 0);
  const title =
    role === 'school_principal'
      ? 'نمره مدرسه'
      : role === 'supervisor_professor'
        ? 'نمره استاد راهنما'
        : role === 'faculty_role'
          ? 'نمره دانشکده'
          : role === 'regional_edu_admin'
            ? 'نمره منطقه'
            : role === 'provincial_university'
              ? 'نمره استان'
              : 'نمرات فراگیران';

  return (
    <section
      aria-labelledby="dashboard-student-grades-card-title"
      style={style}
      className={cn(
        'relative flex min-w-0 flex-col gap-kv-pair overflow-hidden rounded-kv-shell border px-kv-group py-kv-group',
        compact ? 'min-h-0 max-h-[14rem]' : 'h-full min-h-[18rem]',
        workbenchBoxToneClass(isEmpty),
        className
      )}
    >
      <header className="flex shrink-0 flex-col">
        <KvTypography
          variant="subtitle"
          as="h3"
          id="dashboard-student-grades-card-title"
          className="min-w-0 truncate"
        >
          {title}
        </KvTypography>
        <KvTypography variant="caption" tone="muted" as="p">
          بر اساس نمرهٔ نهایی
        </KvTypography>
      </header>

      {isError ? (
        <WorkbenchUnavailableNote forbidden={isForbidden} />
      ) : isLoading ? (
        <WorkbenchBoxBusy
          label="در حال بارگذاری نمرات فراگیران"
          className="min-h-0"
        />
      ) : items.length === 0 ? (
        <KvEmptyState
          title={
            role === 'regional_edu_admin' ||
            role === 'faculty_role' ||
            role === 'provincial_university'
              ? 'هنوز نمره‌ای برای نمایش نیست.'
              : 'هنوز فراگیری برای شما ثبت نشده است.'
          }
          className="min-h-0 flex-1"
        />
      ) : (
        <ul
          aria-label="نمرهٔ نهایی فراگیران"
          className={cn(
            'min-h-0 list-none divide-y divide-kv-border-muted overflow-y-auto',
            compact ? 'max-h-[10rem]' : 'max-h-[22rem]',
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
