'use client';

import Link from 'next/link';
import { useState, type CSSProperties } from 'react';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { FaIcon } from '@/components/shared/FaIcon';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvTypography } from '@/components/shared/KvTypography';
import { useActiveCourseDefinitions } from '@/hooks/useActiveCourseDefinitions';
import { cn } from '@/lib/utils';
import {
  WORKBENCH_RANKING_BODY_CLASS,
  WORKBENCH_RANKING_BOX_CLASS,
  WORKBENCH_RANKING_BOX_STYLE,
  workbenchBoxToneClass,
} from '@/lib/workbench-grid';
import type { UserRole } from '@/types/auth';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { useDashboardStudentGradeRanking } from '../hooks/useDashboardStudentGradeRanking';
import {
  dailyApprovalsCourseHref,
  findEvaluationModuleId,
} from '../lib/course-pending-reports-href';
import type { StudentGradeRankingItem } from '../lib/student-grade-ranking';
import { WorkbenchBoxBusy } from './WorkbenchBoxBusy';
import { WorkbenchUnavailableNote } from './WorkbenchUnavailableNote';

export type WorkbenchStudentGradeRankingBoxProps = {
  role: UserRole;
  className?: string;
  style?: CSSProperties;
};

type Tab = 'weakest' | 'strongest';

/**
 * زمینهٔ بسیار کم‌رنگ هر تب: قرمز برای ضعیف‌ترین‌ها، سبز برای قوی‌ترین‌ها.
 * بردر عمداً رنگ نمی‌گیرد — همان بردر بقیهٔ باکس‌های میز کار (`workbenchBoxToneClass`).
 */
const TAB_BACKGROUND: Record<Tab, string> = {
  weakest: 'color-mix(in srgb, var(--kv-danger) 2.5%, var(--kv-surface))',
  strongest: 'color-mix(in srgb, var(--kv-success) 2.5%, var(--kv-surface))',
};

const TABS: readonly { id: Tab; label: string }[] = [
  { id: 'weakest', label: 'ضعیف‌ترین‌ها' },
  { id: 'strongest', label: 'قوی‌ترین‌ها' },
];

/** به‌جای عکس کاربر: آیکونِ نوعِ فراگیر (دانشجو / مهارت‌آموز) در دایرهٔ رنگی. */
function TraineeIcon({ kind }: { kind: StudentGradeRankingItem['kind'] }) {
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

function RankingList({
  rows,
  tone,
  label,
}: {
  rows: readonly StudentGradeRankingItem[];
  tone: 'low' | 'high';
  label: string;
}) {
  const catalog = useActiveCourseDefinitions();
  if (rows.length === 0) {
    return (
      <KvTypography variant="caption" tone="muted" as="p" className="py-2">
        نمرهٔ نهایی‌ای برای این فهرست ثبت نشده است.
      </KvTypography>
    );
  }
  return (
    <ol
      aria-label={label}
      className="grid list-none content-start divide-y divide-kv-border-muted"
    >
      {rows.map((item) => (
        <RankingRow
          key={item.id}
          item={item}
          tone={tone}
          href={dailyApprovalsCourseHref({
            kind: item.kind,
            moduleId: findEvaluationModuleId(item.courseKey, item.kind, catalog),
            courseKey: item.courseKey,
            query: item.traineeName,
          })}
        />
      ))}
    </ol>
  );
}

function RankingRow({
  item,
  tone,
  href,
}: {
  item: StudentGradeRankingItem;
  tone: 'low' | 'high';
  href: string;
}) {
  return (
    <li>
      <Link
        href={href}
        title={`باز کردن ${item.traineeName} در لیست ${item.courseTitle}`}
        className="-mx-1.5 flex items-center gap-kv-pair rounded-kv-control px-1.5 py-1.5 transition-colors duration-200 can-hover:hover:bg-kv-surface-muted/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kv-brand"
      >
        <TraineeIcon kind={item.kind} />
        <span className="flex min-w-0 flex-1 flex-col gap-1 text-start">
          <span className="truncate text-sm font-bold leading-tight text-kv-text">
            {item.traineeName}
          </span>
          <span className="truncate text-xs leading-tight text-kv-text-muted">
            {item.courseTitle}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={cn(
              'font-sans text-base font-black leading-none tabular-nums',
              tone === 'low' ? 'text-kv-danger' : 'text-kv-success'
            )}
          >
            {toPersianDigits(item.grade)}
          </span>
          <span className="text-[11px] leading-none text-kv-text-faint">
            از ۲۰
          </span>
        </span>
      </Link>
    </li>
  );
}

/**
 * ۶ فراگیرِ ضعیف‌ترین / ۶ فراگیرِ قوی‌ترین بر اساس نمرهٔ نهایی درس — الهام از
 * لیست تراکنش‌ها: به‌جای عکس کاربر، آیکونِ نوعِ فراگیر (دانشجو/مهارت‌آموز).
 * دسکتاپ: هر دو لیست کنار هم؛ موبایل: با تب جابه‌جا می‌شود.
 */
export function WorkbenchStudentGradeRankingBox({
  role: _role,
  className,
  style,
}: WorkbenchStudentGradeRankingBoxProps) {
  const [tab, setTab] = useState<Tab>('weakest');
  const desk = useDashboardStudentGradeRanking(_role);
  const summary = desk.summary;
  const isLoading = desk.isLoading;
  const isError = desk.isError;
  const isForbidden = desk.isForbidden;
  const isEmpty =
    isError ||
    (!isLoading &&
      summary.weakest.length === 0 &&
      summary.strongest.length === 0);

  return (
    <section
      aria-labelledby="dashboard-student-grade-ranking-title"
      style={
        isEmpty
          ? { ...WORKBENCH_RANKING_BOX_STYLE, ...style }
          : {
              ...WORKBENCH_RANKING_BOX_STYLE,
              ...style,
              backgroundColor: TAB_BACKGROUND[tab],
              transition: 'background-color 250ms ease',
            }
      }
      className={cn(
        'relative flex min-w-0 flex-col gap-kv-pair overflow-hidden rounded-kv-shell border px-kv-group py-kv-group',
        WORKBENCH_RANKING_BOX_CLASS,
        workbenchBoxToneClass(isEmpty),
        className
      )}
    >
      {/* عنوان سمت شروع (راست)، تب‌ها سمت پایان (چپ) همان ردیف. */}
      <div className="flex shrink-0 items-start justify-between gap-kv-pair">
        <header className="flex min-w-0 flex-1 flex-col">
          <KvTypography
            variant="subtitle"
            as="h3"
            id="dashboard-student-grade-ranking-title"
            className="min-w-0 truncate"
          >
            برترین و ضعیف‌ترین فراگیران
          </KvTypography>
          <KvTypography variant="caption" tone="muted" as="p">
            بر اساس نمرهٔ نهایی درس
          </KvTypography>
        </header>

        <AppTabs
          value={tab}
          onValueChange={(value) => setTab(value as Tab)}
          className="w-auto shrink-0"
        >
          <AppTabsList aria-label="نوع فهرست">
            {TABS.map(({ id, label }) => (
              <AppTabsTrigger key={id} value={id}>
                {label}
              </AppTabsTrigger>
            ))}
          </AppTabsList>
        </AppTabs>
      </div>

      {/* ردیف‌ها `-mx-1.5` دارند (هاور بیرون از متن)؛ همان مقدار padding، سرریز افقی نمی‌سازد. */}
      <div className={cn(WORKBENCH_RANKING_BODY_CLASS, '-mx-1.5 px-1.5')}>
        {isError ? (
          <WorkbenchUnavailableNote forbidden={isForbidden} />
        ) : isLoading ? (
          <WorkbenchBoxBusy
            label="در حال بارگذاری فهرست فراگیران"
            className="min-h-0"
          />
        ) : isEmpty ? (
          <KvEmptyState
            title="هنوز نمرهٔ نهایی‌ای برای فراگیران شما ثبت نشده است."
            className="min-h-0 py-1"
          />
        ) : (
          <RankingList
            rows={summary[tab]}
            tone={tab === 'weakest' ? 'low' : 'high'}
            label={TABS.find((item) => item.id === tab)?.label ?? ''}
          />
        )}
      </div>
    </section>
  );
}
