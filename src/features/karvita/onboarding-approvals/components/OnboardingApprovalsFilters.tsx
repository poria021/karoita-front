'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import {
  KvFilterBar,
  KvFilterBarControl,
  KvFilterBarSearch,
} from '@/components/shared/KvFilterBar';
import { KvSelectField } from '@/components/shared/KvSelectField';
import { KvSelectItem } from '@/components/shared/KvSelect';
import { KvTextField } from '@/components/shared/KvTextField';
import type { ApprovalRoleFilter } from '@/types/onboarding-approvals';
import { faIcons } from '@/utils/iconMap';

import { APPROVAL_ROLE_FILTER_OPTIONS } from '../constants';

interface OnboardingApprovalsFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  province: string;
  onProvinceChange: (value: string) => void;
  role: ApprovalRoleFilter;
  onRoleChange: (value: ApprovalRoleFilter) => void;
  provinces: string[];
  searchPlaceholder?: string;
}

export function OnboardingApprovalsFilters({
  query,
  onQueryChange,
  province,
  onProvinceChange,
  role,
  onRoleChange,
  provinces,
  searchPlaceholder = 'جستجو...',
}: OnboardingApprovalsFiltersProps) {
  return (
    <KvFilterBar>
      <KvFilterBarSearch>
        <KvTextField
          id="onboarding-approvals-search"
          label={false}
          size="sm"
          value={query}
          placeholder={searchPlaceholder}
          onChange={(event) => onQueryChange(event.target.value)}
          startIcon={<FaIcon icon={faIcons.magnifyingGlass} size="xs" />}
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

      <KvFilterBarControl>
        <KvSelectField
          id="onboarding-approvals-role"
          label={false}
          size="sm"
          value={role}
          onValueChange={(value) => onRoleChange(value as ApprovalRoleFilter)}
          placeholder="همه نقش‌ها"
        >
          {APPROVAL_ROLE_FILTER_OPTIONS.map((option) => (
            <KvSelectItem key={option.value} value={option.value}>
              {option.label}
            </KvSelectItem>
          ))}
        </KvSelectField>
      </KvFilterBarControl>
    </KvFilterBar>
  );
}
