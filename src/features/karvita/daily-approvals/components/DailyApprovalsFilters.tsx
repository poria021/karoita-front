'use client';

import { KvSearchField } from '@/components/shared/fields/KvSearchField';
import {
  KvSelect,
  KvSelectContent,
  KvSelectItem,
  KvSelectTrigger,
  KvSelectValue,
} from '@/components/shared/fields/KvSelect';
import type { DailyApprovalCourseFilter } from '@/types/daily-approvals';

type DailyApprovalsFiltersProps = {
  query: string;
  course: DailyApprovalCourseFilter;
  courseOptions: readonly {
    value: DailyApprovalCourseFilter;
    label: string;
  }[];
  onQueryChange: (value: string) => void;
  onCourseChange: (value: DailyApprovalCourseFilter) => void;
  mobile?: boolean;
};

export function DailyApprovalsFilters({
  query,
  course,
  courseOptions,
  onQueryChange,
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

      <div className={mobile ? 'w-full' : 'w-full min-w-0 flex-1'}>
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
  );
}
