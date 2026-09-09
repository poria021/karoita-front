'use client';

import { KvSearchField } from '@/components/shared/fields/KvSearchField';
import { KvTypography } from '@/components/shared/KvTypography';
import { toPersianDigits } from '@/utils/persianDigits';

type SupervisorSelectionFiltersProps = {
  courseName: string;
  level: number;
  query: string;
  onQueryChange: (value: string) => void;
};

export function SupervisorSelectionFilters({
  courseName,
  level,
  query,
  onQueryChange,
}: SupervisorSelectionFiltersProps) {
  return (
    <div className="space-y-kv-group border-b border-kv-border pb-kv-group">
      <div className="flex flex-col items-stretch gap-kv-pair sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 text-start">
          <KvTypography variant="subtitle" as="h2">
            اخذ واحد {courseName} {toPersianDigits(level)}
          </KvTypography>
          <KvTypography variant="caption" tone="muted" as="p">
            استاد راهنمای مدنظر خود را انتخاب کرده و ثبت نهایی را بزنید.
          </KvTypography>
        </div>

        <div className="w-full sm:w-72">
          <KvSearchField
            id="internship-supervisor-search"
            value={query}
            placeholder="جستجوی نام استاد..."
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
