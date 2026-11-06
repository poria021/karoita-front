'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvTypography } from '@/components/shared/KvTypography';
import { COURSE_OFFERING_AUDIENCE_TABS } from '@/features/karvita/syllabus-config/constants';
import { cn } from '@/lib/utils';
import { WORKBENCH_FULL_SPAN } from '@/lib/workbench-grid';
import { RouteService } from '@/services/route.service';
import type { AcademicTermType } from '@/types/syllabus-config';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { useDashboardActiveTermStatus } from '../hooks/useDashboardActiveTermStatus';
import type { ActiveTermCourseView } from '../lib/active-term-status';

export type WorkbenchActiveTermStatusBoxProps = {
  className?: string;
  style?: CSSProperties;
};

function GateChip({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-kv-tight px-2 py-0.5 text-[11px] font-bold',
        active
          ? 'bg-kv-success-soft text-kv-success-soft-fg'
          : 'bg-kv-surface-muted text-kv-text-muted'
      )}
    >
      {label}
      {active ? ' · باز' : ' · بسته'}
    </span>
  );
}

function CourseWeekRow({ course }: { course: ActiveTermCourseView }) {
  return (
    <li className="flex items-center justify-between gap-2.5 rounded-kv-control border border-kv-border bg-kv-surface px-2.5 py-1.5">
      <span className="flex min-w-0 items-center gap-2">
        <FaIcon
          icon={faIcons.bookOpen}
          size="xs"
          aria-hidden
          className="shrink-0 text-kv-text-muted"
        />
        <span className="truncate font-sans text-sm font-bold text-kv-text">
          {course.title}
        </span>
      </span>
      <span className="shrink-0 text-xs font-semibold text-kv-text-muted">
        {toPersianDigits(course.weekCount)} هفته
      </span>
    </li>
  );
}

/**
 * باکس میز کار مدیر ارشد: آخرین ترم فعال ترمی/پودمانی + درس‌ها و تعداد هفته.
 */
export function WorkbenchActiveTermStatusBox({
  className,
  style,
}: WorkbenchActiveTermStatusBoxProps) {
  const { audience, setAudience, isLoading, isError, view } =
    useDashboardActiveTermStatus();
  const href = RouteService.karvita.syllabusTermSettings();
  const term = view.term;

  return (
    <section
      aria-labelledby="dashboard-active-term-title"
      style={style}
      className={cn(
        WORKBENCH_FULL_SPAN,
        'flex min-h-0 min-w-0 flex-col gap-kv-group overflow-hidden rounded-kv-shell border border-kv-border/70 bg-kv-surface p-kv-group shadow-kv-soft',
        className
      )}
    >
      <header className="flex shrink-0 flex-wrap items-center gap-kv-inline">
        <KvTypography
          variant="subtitle"
          as="h3"
          id="dashboard-active-term-title"
          className="min-w-0 flex-1 truncate"
        >
          ترم فعال
        </KvTypography>
        <KvButton
          asChild
          color="cta"
          appearance="text"
          size="xs"
          className="shrink-0 text-[11px] font-bold"
        >
          <Link href={href} prefetch>
            تنظیمات ترم
          </Link>
        </KvButton>
      </header>

      <AppTabs
        value={audience}
        onValueChange={(value) => setAudience(value as AcademicTermType)}
      >
        <AppTabsList aria-label="نوع ترم">
          {COURSE_OFFERING_AUDIENCE_TABS.map((tab) => (
            <AppTabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </AppTabsTrigger>
          ))}
        </AppTabsList>
      </AppTabs>

      {isError ? (
        <KvTypography variant="caption" tone="muted" as="p">
          فعلاً در دسترس نیست.
        </KvTypography>
      ) : isLoading ? (
        <div
          role="status"
          aria-label="در حال بارگذاری ترم فعال"
          className="h-28 animate-pulse rounded-kv-control bg-kv-surface-muted"
        />
      ) : !term ? (
        <KvEmptyState
          title={
            audience === 'modular'
              ? 'پودمان فعالی تعریف نشده است.'
              : 'نیم‌سال فعالی تعریف نشده است.'
          }
          className="min-h-0 py-kv-pair"
        />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-kv-group overflow-hidden">
          <div className="shrink-0 space-y-2">
            <p className="font-sans text-base font-black tracking-tight text-kv-text">
              {term.title}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <GateChip label="برگزاری کلاس" active={term.isTermOpen} />
              <GateChip label="انتخاب واحد" active={term.isEnrollOpen} />
            </div>
          </div>

          {view.courses.length === 0 ? (
            <KvEmptyState
              title="هنوز درس فعالی برای این ترم ارائه نشده است."
              className="min-h-0 py-kv-pair"
            />
          ) : (
            <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto [scrollbar-width:thin]">
              {view.courses.map((course) => (
                <CourseWeekRow key={course.id} course={course} />
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
