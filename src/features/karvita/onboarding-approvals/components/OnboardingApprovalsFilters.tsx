'use client';

import { FaIcon } from '@/components/shared/FaIcon';
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
  /** Wider search placeholder on mobile. */
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
    <div className="flex w-full flex-col items-stretch gap-2 sm:flex-row sm:items-center">
      <div className="relative w-full flex-1">
        <KvTextField
          id="onboarding-approvals-search"
          label={false}
          size="sm"
          value={query}
          placeholder={searchPlaceholder}
          onChange={(event) => onQueryChange(event.target.value)}
          startAddon={
            <span className="ps-3 text-kv-text-faint">
              <FaIcon icon={faIcons.magnifyingGlass} size="xs" />
            </span>
          }
        />
      </div>

      <div className="w-full shrink-0 sm:w-36">
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
      </div>

      <div className="w-full shrink-0 sm:w-36">
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
      </div>
    </div>
  );
}
