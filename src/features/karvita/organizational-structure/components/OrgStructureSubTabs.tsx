'use client';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { FaIcon } from '@/components/shared/FaIcon';
import type { OrgStructureSubTab } from '@/types/org-structure';

import { ORG_STRUCTURE_TABS } from '../constants';

interface OrgStructureSubTabsProps {
  active: OrgStructureSubTab;
  onChange: (tab: OrgStructureSubTab) => void;
}

export function OrgStructureSubTabs({
  active,
  onChange,
}: OrgStructureSubTabsProps) {
  const handleChange = (value: string) => {
    onChange(value as OrgStructureSubTab);
  };

  return (
    <div className="mb-kv-pair">
      <AppTabs value={active} onValueChange={handleChange} gridCols={3}>
        <AppTabsList aria-label="تقسیمات ساختاری">
          {ORG_STRUCTURE_TABS.map((tab) => (
            <AppTabsTrigger key={tab.key} value={tab.key}>
              <FaIcon icon={tab.icon} size="xs" />
              <span className="truncate lg:hidden">{tab.shortLabel}</span>
              <span className="hidden truncate lg:inline">{tab.label}</span>
            </AppTabsTrigger>
          ))}
        </AppTabsList>
      </AppTabs>
    </div>
  );
}
