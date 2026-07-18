'use client';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { FaIcon } from '@/components/shared/FaIcon';
import { KvTypography } from '@/components/shared/KvTypography';
import type { OrgStructureSubTab } from '@/types/org-structure';

import { ORG_STRUCTURE_TABS } from '../constants';

interface OrgStructureSubTabsProps {
  active: OrgStructureSubTab;
  onChange: (tab: OrgStructureSubTab) => void;
}

/**
 * Desktop: AppTabs capsule row.
 * Mobile: AppTabs `listLayout="grid"` (3 cols) — same tokens, no parallel chrome.
 */
export function OrgStructureSubTabs({
  active,
  onChange,
}: OrgStructureSubTabsProps) {
  const handleChange = (value: string) => {
    onChange(value as OrgStructureSubTab);
  };

  return (
    <div className="mb-kv-section space-y-kv-group">
      <div className="hidden lg:block">
        <AppTabs value={active} onValueChange={handleChange}>
          <AppTabsList aria-label="تقسیمات ساختاری">
            {ORG_STRUCTURE_TABS.map((tab) => (
              <AppTabsTrigger key={tab.key} value={tab.key}>
                <FaIcon icon={tab.icon} size="xs" />
                <span>{tab.label}</span>
              </AppTabsTrigger>
            ))}
          </AppTabsList>
        </AppTabs>
      </div>

      <div className="block w-full space-y-2 lg:hidden">
        <KvTypography
          variant="caption"
          tone="muted"
          as="p"
          weight="black"
          align="end"
        >
          انتخاب تقسیمات ساختاری:
        </KvTypography>
        <AppTabs
          value={active}
          onValueChange={handleChange}
          listLayout="grid"
          gridCols={3}
        >
          <AppTabsList aria-label="تقسیمات ساختاری">
            {ORG_STRUCTURE_TABS.map((tab) => (
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
