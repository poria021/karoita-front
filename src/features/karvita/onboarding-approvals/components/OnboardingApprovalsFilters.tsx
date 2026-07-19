'use client';

import {
  KvFilterBar,
  KvFilterBarControl,
  KvFilterBarSearch,
} from '@/components/shared/fields/KvFilterBar';
import { KvSearchField } from '@/components/shared/fields/KvSearchField';
import { KvSelectField } from '@/components/shared/fields/KvSelectField';
import { KvSelectItem } from '@/components/shared/fields/KvSelect';

interface OnboardingApprovalsFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  province: string;
  onProvinceChange: (value: string) => void;
  provinces: string[];
  searchPlaceholder?: string;
}

export function OnboardingApprovalsFilters({
  query,
  onQueryChange,
  province,
  onProvinceChange,
  provinces,
  searchPlaceholder = 'جستجو...',
}: OnboardingApprovalsFiltersProps) {
  return (
    <KvFilterBar>
      <KvFilterBarSearch>
        <KvSearchField
          id="onboarding-approvals-search"
          value={query}
          placeholder={searchPlaceholder}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </KvFilterBarSearch>

      <KvFilterBarControl>
        <KvSelectField
          id="onboarding-approvals-province"
          label={false}
          size="sm"
          value={province}
          onValueChange={onProvinceChange}
          placeholder="همه استان‌ها"
        >
          <KvSelectItem value="all">همه استان‌ها</KvSelectItem>
          {provinces.map((name) => (
            <KvSelectItem key={name} value={name}>
              {name}
            </KvSelectItem>
          ))}
        </KvSelectField>
      </KvFilterBarControl>
    </KvFilterBar>
  );
}
