'use client';

import { useState, type CSSProperties } from 'react';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { FaIcon } from '@/components/shared/FaIcon';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { workbenchBoxToneClass } from '@/lib/workbench-grid';
import type { UserRole } from '@/types/auth';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { useDashboardTeacherResponseRanking } from '../hooks/useDashboardTeacherResponseRanking';
import type { TeacherResponseRankingItem } from '../lib/teacher-response-ranking';
import {
  FAKE_TEACHER_RESPONSE_RANKING,
  TEACHER_RESPONSE_RANKING_FAKE_PREVIEW,
} from '../lib/teacher-response-ranking-preview';
import { WorkbenchUnavailableNote } from './WorkbenchUnavailableNote';

export type WorkbenchTeacherResponseRankingBoxProps = {
  role: UserRole;
  className?: string;
  style?: CSSProperties;
};

type Tab = 'weakest' | 'strongest';

/** زمینهٔ بسیار کم‌رنگ هر تب: قرمز برای ضعیف‌ترین‌ها، سبز برای قوی‌ترین‌ها. */
const TAB_BACKGROUND: Record<Tab, string> = {
  weakest: 'color-mix(in srgb, var(--kv-danger) 2.5%, var(--kv-surface))',
  strongest: 'color-mix(in srgb, var(--kv-success) 2.5%, var(--kv-surface))',
};

const TABS: readonly { id: Tab; label: string }[] = [
  { id: 'weakest', label: 'ضعیف‌ترین‌ها' },
  { id: 'strongest', label: 'قوی‌ترین‌ها' },
];

function TeacherRow({
  item,
  tone,
}: {
  item: TeacherResponseRankingItem;
  tone: 'low' | 'high';
}) {
  return (
    <li className="flex items-center gap-kv-pair py-1.5">
      <span
        aria-hidden
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-kv-brand-soft text-kv-brand-soft-fg"
      >
        <FaIcon icon={faIcons.chalkboardUser} size="sm" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1 text-start">
        <span className="truncate text-sm font-bold leading-tight text-kv-text">
          {item.name}
        </span>
        {item.learnerCount !== undefined ? (
          <span className="truncate text-xs leading-tight text-kv-text-muted">
            {toPersianDigits(item.learnerCount)} فراگیر
          </span>
        ) : null}
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <span
          className={cn(
            'font-sans text-base font-black leading-none tabular-nums',
            tone === 'low' ? 'text-kv-danger' : 'text-kv-success'
          )}
        >
          {toPersianDigits(Math.round(item.response))}٪
        </span>
        <span className="text-[11px] leading-none text-kv-text-faint">
          نرخ پاسخ‌دهی
        </span>
      </span>
    </li>
  );
}

/**
 * ۶ معلمِ ضعیف‌ترین / ۶ معلمِ قوی‌ترین بر اساس نرخ پاسخ‌دهی به گزارش‌ها —
 * میز کار مدیر مدرسه (جای «برترین و ضعیف‌ترین فراگیران») و آموزش و پرورش منطقه.
 * دو تب مثل باکس فراگیران.
 */
export function WorkbenchTeacherResponseRankingBox({
  role,
  className,
  style,
}: WorkbenchTeacherResponseRankingBoxProps) {
  const [tab, setTab] = useState<Tab>('weakest');
  const desk = useDashboardTeacherResponseRanking(role);
  // پیش‌نمایش با داده‌ی ماکت (فقط development، فقط آموزش و پرورش منطقه) —
  // برای خاموش کردن: teacher-response-ranking-preview.ts
  const preview =
    TEACHER_RESPONSE_RANKING_FAKE_PREVIEW && role === 'regional_edu_admin';
  const summary = preview ? FAKE_TEACHER_RESPONSE_RANKING : desk.summary;
  const isLoading = preview ? false : desk.isLoading;
  const isError = preview ? false : desk.isError;
  const isForbidden = preview ? false : desk.isForbidden;
  const isEmpty =
    isError ||
    (!isLoading &&
      summary.weakest.length === 0 &&
      summary.strongest.length === 0);
  const rows = summary[tab];
  // آموزش و پرورش منطقه همین API را می‌خواند؛ محدوده (منطقه/مدرسه) را بک‌اند تعیین می‌کند.
  const scopeLabel = role === 'regional_edu_admin' ? 'منطقه' : 'مدرسه';

  return (
    <section
      aria-labelledby="dashboard-teacher-response-ranking-title"
      style={
        isEmpty
          ? style
          : {
              ...style,
              backgroundColor: TAB_BACKGROUND[tab],
              transition: 'background-color 250ms ease',
            }
      }
      className={cn(
        'relative flex h-full min-w-0 flex-col gap-kv-pair overflow-hidden rounded-kv-shell border px-kv-group py-kv-group',
        workbenchBoxToneClass(isEmpty),
        className
      )}
    >
      <div className="flex shrink-0 items-start justify-between gap-kv-pair">
        <header className="flex min-w-0 flex-1 flex-col">
          <KvTypography
            variant="subtitle"
            as="h3"
            id="dashboard-teacher-response-ranking-title"
            className="min-w-0 truncate"
          >
            ضعیف‌ترین و قوی‌ترین معلمان {scopeLabel}
          </KvTypography>
          <KvTypography variant="caption" tone="muted" as="p">
            بر اساس نرخ پاسخ‌دهی
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

      {isError ? (
        <WorkbenchUnavailableNote forbidden={isForbidden} />
      ) : isLoading ? (
        <div
          role="status"
          aria-label="در حال بارگذاری فهرست معلمان"
          className="min-h-0 flex-1 animate-pulse rounded-kv-control bg-kv-surface-muted"
        />
      ) : isEmpty ? (
        <KvEmptyState
          title={`هنوز معلمی برای ${scopeLabel === 'منطقه' ? 'منطقهٔ' : 'مدرسهٔ'} شما ثبت نشده است.`}
          className="min-h-0 py-1"
        />
      ) : (
        <ol
          aria-label={TABS.find((item) => item.id === tab)?.label ?? ''}
          className="grid list-none content-start divide-y divide-kv-border-muted"
        >
          {rows.map((item) => (
            <TeacherRow
              key={item.id}
              item={item}
              tone={tab === 'weakest' ? 'low' : 'high'}
            />
          ))}
        </ol>
      )}
    </section>
  );
}
