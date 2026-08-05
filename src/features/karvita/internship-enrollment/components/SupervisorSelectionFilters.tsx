'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import {
  KvFilterBar,
  KvFilterBarControl,
  KvFilterBarSearch,
} from '@/components/shared/fields/KvFilterBar';
import {
  KvSelect,
  KvSelectContent,
  KvSelectItem,
  KvSelectTrigger,
  KvSelectValue,
} from '@/components/shared/fields/KvSelect';
import { KvSearchField } from '@/components/shared/fields/KvSearchField';
import { KvTypography } from '@/components/shared/KvTypography';
import type { InternshipSelectionScope } from '@/types/internship-enrollment';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

type SupervisorSelectionFiltersProps = {
  courseName: string;
  level: number;
  query: string;
  province: string;
  college: string;
  scope: InternshipSelectionScope;
  onQueryChange: (value: string) => void;
  onProvinceChange: (value: string) => void;
  onCollegeChange: (value: string) => void;
};

export function SupervisorSelectionFilters({
  courseName,
  level,
  query,
  province,
  college,
  scope,
  onQueryChange,
  onProvinceChange,
  onCollegeChange,
}: SupervisorSelectionFiltersProps) {
  const colleges = scope.collegesByProvince[province] ?? [];

  return (
    <div className="space-y-kv-group border-b border-kv-border pb-kv-group">
      <div className="flex flex-col gap-kv-pair text-start">
        <KvTypography variant="subtitle" as="h2">
          اخذ واحد {courseName} {toPersianDigits(level)}
        </KvTypography>
        <KvTypography variant="caption" tone="muted" as="p">
          استاد راهنمای مدنظر خود را انتخاب کرده و ثبت نهایی را بزنید.
        </KvTypography>
        {scope.canChangeScope ? (
          <div className="flex w-fit items-center gap-kv-pair rounded-kv-control border border-kv-info-border bg-kv-info-soft px-kv-field py-kv-pair text-kv-info">
            <FaIcon icon={faIcons.key} size="xs" aria-hidden />
            <KvTypography variant="caption" as="span" weight="bold">
              امتیاز ویژه: جست‌وجوی برون‌پردیسی برای شما فعال است.
            </KvTypography>
          </div>
        ) : null}
      </div>

      <KvFilterBar>
        <KvFilterBarSearch>
          <KvSearchField
            id="internship-supervisor-search"
            value={query}
            placeholder="جستجوی نام استاد..."
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </KvFilterBarSearch>

        <KvFilterBarControl>
          <KvSelect
            value={province}
            onValueChange={onProvinceChange}
            disabled={!scope.canChangeScope}
          >
            <KvSelectTrigger
              aria-label="استان"
              className="disabled:border-kv-border-disabled disabled:bg-kv-field-disabled disabled:text-kv-text-disabled"
            >
              <KvSelectValue placeholder="استان" />
            </KvSelectTrigger>
            <KvSelectContent>
              {scope.provinces.map((item) => (
                <KvSelectItem key={item} value={item}>
                  {item}
                </KvSelectItem>
              ))}
            </KvSelectContent>
          </KvSelect>
        </KvFilterBarControl>

        <KvFilterBarControl width="md">
          <KvSelect
            value={college}
            onValueChange={onCollegeChange}
            disabled={!scope.canChangeScope}
          >
            <KvSelectTrigger
              aria-label="پردیس"
              className="disabled:border-kv-border-disabled disabled:bg-kv-field-disabled disabled:text-kv-text-disabled"
            >
              <KvSelectValue placeholder="پردیس" />
            </KvSelectTrigger>
            <KvSelectContent>
              {colleges.map((item) => (
                <KvSelectItem key={item} value={item}>
                  {item}
                </KvSelectItem>
              ))}
            </KvSelectContent>
          </KvSelect>
        </KvFilterBarControl>
      </KvFilterBar>
    </div>
  );
}
