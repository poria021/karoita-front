'use client';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { FaIcon } from '@/components/shared/FaIcon';
import type { ApprovalFilterTab } from '@/types/onboarding-approvals';

import { ONBOARDING_APPROVAL_TABS } from '../constants';

interface OnboardingApprovalsTabsProps {
  active: ApprovalFilterTab;
  onChange: (tab: ApprovalFilterTab) => void;
}

export function OnboardingApprovalsTabs({
  active,
  onChange,
}: OnboardingApprovalsTabsProps) {
  const handleChange = (value: string) => {
    onChange(value as ApprovalFilterTab);
  };

  return (
    <div className="mb-kv-section space-y-kv-group">
      <div className="hidden lg:block">
        <AppTabs value={active} onValueChange={handleChange}>
          <AppTabsList aria-label="وضعیت بررسی مدارک">
            {ONBOARDING_APPROVAL_TABS.map((tab) => (
              <AppTabsTrigger key={tab.key} value={tab.key}>
                <FaIcon icon={tab.icon} size="xs" />
                <span>{tab.label}</span>
              </AppTabsTrigger>
            ))}
          </AppTabsList>
        </AppTabs>
      </div>

      <div className="block w-full space-y-2 lg:hidden">
        <AppTabs
          value={active}
          onValueChange={handleChange}
          listLayout="grid"
          gridCols={3}
        >
          <AppTabsList aria-label="وضعیت بررسی مدارک">
            {ONBOARDING_APPROVAL_TABS.map((tab) => (
              <AppTabsTrigger key={tab.key} value={tab.key}>
                <FaIcon icon={tab.icon} size="xs" />
                <span>{tab.shortLabel}</span>
              </AppTabsTrigger>
            ))}
          </AppTabsList>
        </AppTabs>
      </div>
    </div>
  );
}
