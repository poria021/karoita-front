'use client';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { FaIcon } from '@/components/shared/FaIcon';
import type { SyllabusConfigSubTab } from '@/types/syllabus-config';

import { SYLLABUS_CONFIG_TABS } from '../constants';

interface SyllabusConfigSubTabsProps {
  active: SyllabusConfigSubTab;
  onChange: (tab: SyllabusConfigSubTab) => void;
}

export function SyllabusConfigSubTabs({
  active,
  onChange,
}: SyllabusConfigSubTabsProps) {
  const handleChange = (value: string) => {
    onChange(value as SyllabusConfigSubTab);
  };

  return (
    <div className="mb-kv-section space-y-kv-group">
      <div className="hidden sm:block">
        <AppTabs value={active} onValueChange={handleChange}>
          <AppTabsList aria-label="مدیریت ترم و سرفصل">
            {SYLLABUS_CONFIG_TABS.map((tab) => (
              <AppTabsTrigger key={tab.key} value={tab.key}>
                <FaIcon icon={tab.icon} size="xs" />
                <span>{tab.label}</span>
              </AppTabsTrigger>
            ))}
          </AppTabsList>
        </AppTabs>
      </div>

      <div className="block w-full sm:hidden">
        <AppTabs
          value={active}
          onValueChange={handleChange}
          listLayout="grid"
          gridCols={2}
        >
          <AppTabsList aria-label="مدیریت ترم و سرفصل">
            {SYLLABUS_CONFIG_TABS.map((tab) => (
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
