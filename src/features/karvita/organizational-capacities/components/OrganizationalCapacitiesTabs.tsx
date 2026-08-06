'use client';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import type { OrganizationalCapacityKind } from '@/types/organizational-capacities';

import { CAPACITY_KIND_TABS } from '../constants';

type OrganizationalCapacitiesTabsProps = {
  value: OrganizationalCapacityKind;
  onChange: (value: OrganizationalCapacityKind) => void;
};

export function OrganizationalCapacitiesTabs({
  value,
  onChange,
}: OrganizationalCapacitiesTabsProps) {
  return (
    <AppTabs
      value={value}
      gridCols={2}
      onValueChange={(nextValue) => {
        const tab = CAPACITY_KIND_TABS.find((item) => item.value === nextValue);
        if (tab) onChange(tab.value);
      }}
    >
      <AppTabsList aria-label="نوع ظرفیت پذیرش">
        {CAPACITY_KIND_TABS.map((tab) => (
          <AppTabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </AppTabsTrigger>
        ))}
      </AppTabsList>
    </AppTabs>
  );
}
