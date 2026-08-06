'use client';

import { KvSearchField } from '@/components/shared/fields/KvSearchField';
import {
  KvSelect,
  KvSelectContent,
  KvSelectItem,
  KvSelectTrigger,
  KvSelectValue,
} from '@/components/shared/fields/KvSelect';
import type { DailyApprovalReadFilter } from '@/types/daily-approvals';

import { DAILY_APPROVAL_READ_FILTER_OPTIONS } from '../constants';

type DailyApprovalsFiltersProps = {
  query: string;
  readFilter: DailyApprovalReadFilter;
  onQueryChange: (value: string) => void;
  onReadFilterChange: (value: DailyApprovalReadFilter) => void;
  mobile?: boolean;
};

export function DailyApprovalsFilters({
  query,
  readFilter,
  onQueryChange,
  onReadFilterChange,
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
    </div>
  );
}
