'use client';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';

import { ORG_ACCOUNT_KIND_TABS, type OrgAccountKind } from '../constants';

type AdminUserCreationRoleKindTabsProps = {
  value: OrgAccountKind;
  onChange: (value: string) => void;
};

export function AdminUserCreationRoleKindTabs({
  value,
  onChange,
}: AdminUserCreationRoleKindTabsProps) {
  return (
    <AppTabs
      value={value}
      onValueChange={onChange}
      className="w-fit gap-0"
    >
      <AppTabsList
        aria-label="نوع حساب"
        className="h-11 w-fit max-w-full p-0.5"
      >
        {ORG_ACCOUNT_KIND_TABS.map((tab) => (
          <AppTabsTrigger
            key={tab.value}
            value={tab.value}
            className="h-full min-h-0 w-auto flex-none py-0 md:min-h-0"
          >
            {tab.label}
          </AppTabsTrigger>
        ))}
      </AppTabsList>
    </AppTabs>
  );
}
