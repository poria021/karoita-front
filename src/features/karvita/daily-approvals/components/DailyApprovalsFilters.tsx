'use client';

import { KvSearchField } from '@/components/shared/fields/KvSearchField';
import {
  KvSelect,
  KvSelectContent,
  KvSelectItem,
  KvSelectTrigger,
  KvSelectValue,
} from '@/components/shared/fields/KvSelect';
import type {
  DailyApprovalCourseFilter,
  DailyApprovalReadFilter,
} from '@/types/daily-approvals';

import { DAILY_APPROVAL_READ_FILTER_OPTIONS } from '../constants';

type DailyApprovalsFiltersProps = {
  query: string;
  readFilter: DailyApprovalReadFilter;
  course: DailyApprovalCourseFilter;
  courseOptions: readonly { value: DailyApprovalCourseFilter; label: string }[];
  onQueryChange: (value: string) => void;
  onReadFilterChange: (value: DailyApprovalReadFilter) => void;
  onCourseChange: (value: DailyApprovalCourseFilter) => void;
  mobile?: boolean;
};

export function DailyApprovalsFilters({
  query,
  readFilter,
  course,
  courseOptions,
  onQueryChange,
  onReadFilterChange,
  onCourseChange,
  mobile = false,
}: DailyApprovalsFiltersProps) {
  return (
    <div
      className={
        mobile
          ? 'space-y-kv-group rounded-kv-panel border border-kv-border bg-kv-surface p-kv-group'
          : 'flex w-full flex-col items-stretch gap-kv-pair lg:flex-row lg:items-center'
      }
    >
      {mobile ? (
        <span className="border-b border-kv-border pb-kv-pair text-xs font-black text-kv-text-faint">
          جستجو و فیلترهای پایش:
        </span>
      ) : null}

      <div className={mobile ? 'w-full' : 'w-full min-w-0 flex-[2]'}>
        <KvSearchField
          label={false}
          value={query}
          placeholder="جستجوی نام کارورز یا شناسه..."
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>

      <div
        className={
          mobile
            ? 'grid grid-cols-2 gap-kv-pair'
            : 'flex w-full min-w-0 flex-1 flex-row items-center gap-kv-pair'
        }
      >
        <div className="min-w-0 flex-1">
          <KvSelect
            value={readFilter}
            onValueChange={(value) => {
              const option = DAILY_APPROVAL_READ_FILTER_OPTIONS.find(
                (item) => item.value === value
              );
              if (option) onReadFilterChange(option.value);
            }}
          >
            <KvSelectTrigger aria-label="فیلتر خوانده شدن">
              <KvSelectValue />
            </KvSelectTrigger>
            <KvSelectContent>
              {DAILY_APPROVAL_READ_FILTER_OPTIONS.map((option) => (
                <KvSelectItem key={option.value} value={option.value}>
                  {mobile ? option.mobileLabel : option.label}
                </KvSelectItem>
              ))}
            </KvSelectContent>
          </KvSelect>
        </div>

        <div className="min-w-0 flex-1">
          <KvSelect
            value={course}
            onValueChange={(value) => {
              const option = courseOptions.find((item) => item.value === value);
              if (option) onCourseChange(option.value);
            }}
          >
            <KvSelectTrigger aria-label="فیلتر درس">
              <KvSelectValue />
            </KvSelectTrigger>
            <KvSelectContent>
              {courseOptions.map((option) => (
                <KvSelectItem key={option.value} value={option.value}>
                  {option.label}
                </KvSelectItem>
              ))}
            </KvSelectContent>
          </KvSelect>
        </div>
      </div>
    </div>
  );
}
