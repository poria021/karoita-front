'use client';

import Link from 'next/link';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import {
  KvCard,
  KvCardContent,
  KvCardIdentity,
} from '@/components/shared/KvCard';
import { KvTypography } from '@/components/shared/KvTypography';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import type { LearnerActiveCourse } from '../lib/learner-workbench';

type DashboardLearnerActiveCourseBoxProps = {
  course: LearnerActiveCourse | null;
  isLoading?: boolean;
  className?: string;
};

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <KvTypography variant="caption" tone="muted" as="p" className="font-bold">
        {label}
      </KvTypography>
      <KvTypography variant="body" as="p" className="truncate text-sm font-bold">
        {value}
      </KvTypography>
    </div>
  );
}

function StatChip({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'warning' | 'danger' | 'brand';
}) {
  return (
    <div
      className={cn(
        'min-w-0 flex-1 rounded-kv-control border border-kv-border/60 bg-kv-surface-muted/60 px-kv-group py-kv-pair',
        tone === 'warning' && 'border-kv-warning/30 bg-kv-warning-soft/50',
        tone === 'danger' && 'border-kv-danger/30 bg-kv-danger-soft/40',
        tone === 'brand' && 'border-kv-brand/25 bg-kv-brand-soft/50'
      )}
    >
      <KvTypography variant="caption" tone="muted" as="p" className="font-bold">
        {label}
      </KvTypography>
      <p
        className={cn(
          'mt-1 font-sans text-lg font-black tabular-nums leading-none tracking-tight',
          tone === 'warning' && 'text-kv-warning',
          tone === 'danger' && 'text-kv-danger',
          tone === 'brand' && 'text-kv-brand',
          tone === 'default' && 'text-kv-text'
        )}
      >
        {value}
      </p>
    </div>
  );
}

/** باکس دورهٔ فعال — ترم، ناظران، پیشرفت هفته‌ها و نمرهٔ پیش‌رونده. */
export function DashboardLearnerActiveCourseBox({
  course,
  isLoading = false,
  className,
}: DashboardLearnerActiveCourseBoxProps) {
  if (isLoading) {
    return (
      <div
        aria-hidden
        className={cn(
          'min-h-[14rem] animate-pulse rounded-kv-shell border border-kv-border/70 bg-kv-surface shadow-kv-soft',
          className
        )}
      />
    );
  }

  if (!course) return null;

  const grade = course.progressiveGrade;
  const gradeLabel =
    grade?.final20 != null
      ? toPersianDigits(grade.final20.toFixed(2))
      : '—';

  return (
    <KvCard
      tone="surface"
      padding="none"
      className={cn(
        'h-full overflow-hidden border-kv-border/70 shadow-kv-soft',
        className
      )}
      aria-label="دوره فعال"
    >
      <KvCardContent padding="md" stacked className="gap-kv-group">
        <header className="flex flex-wrap items-start justify-between gap-kv-group">
          <KvCardIdentity
            leading={
              <span className="flex size-11 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand-soft text-kv-brand-soft-fg shadow-kv-soft">
                <FaIcon icon={faIcons.graduationCap} size="sm" />
              </span>
            }
          >
            <div className="min-w-0 space-y-1 text-start">
              <KvTypography variant="caption" tone="muted" as="p" className="font-bold">
                دورهٔ فعال
              </KvTypography>
              <KvTypography variant="subtitle" weight="bold" as="h3">
                {course.courseTitle}
              </KvTypography>
              <KvTypography variant="caption" tone="muted" as="p">
                {course.termTitle}
              </KvTypography>
            </div>
          </KvCardIdentity>
          <Badge variant={course.enrolled ? 'success' : 'default'}>
            {course.enrolled ? 'ثبت‌نام‌شده' : 'بدون ثبت‌نام'}
          </Badge>
        </header>

        {course.enrolled ? (
          <div className="grid gap-kv-group sm:grid-cols-3">
            <MetaRow
              label="استاد راهنما"
              value={course.supervisorName || '—'}
            />
            <MetaRow label="مدرسه" value={course.schoolName || '—'} />
            <MetaRow
              label="معلم راهنما"
              value={course.mentorName || '—'}
            />
          </div>
        ) : (
          <KvTypography variant="body" tone="muted" as="p" className="text-sm">
            هنوز برای این سطح ثبت‌نام نکرده‌اید. از اقدام بعدی یا دکمهٔ زیر وارد
            صفحهٔ درس شوید.
          </KvTypography>
        )}

        {course.weekStats ? (
          <div className="flex flex-wrap gap-kv-pair">
            <StatChip
              label="پیشرفت ترم"
              value={`${toPersianDigits(course.weekStats.submittedPercent)}٪`}
              tone="brand"
            />
            <StatChip
              label="معوق"
              value={toPersianDigits(course.weekStats.overdue)}
              tone={course.weekStats.overdue > 0 ? 'danger' : 'default'}
            />
            <StatChip
              label="نیاز به اصلاح"
              value={toPersianDigits(course.weekStats.needsEdit)}
              tone={course.weekStats.needsEdit > 0 ? 'warning' : 'default'}
            />
            <StatChip
              label="نمره از ۲۰"
              value={gradeLabel}
              tone="brand"
            />
          </div>
        ) : null}

        <div className="flex justify-end">
          <KvButton asChild appearance="secondary" size="sm">
            <Link href={course.href} prefetch>
              رفتن به صفحه درس
            </Link>
          </KvButton>
        </div>
      </KvCardContent>
    </KvCard>
  );
}
