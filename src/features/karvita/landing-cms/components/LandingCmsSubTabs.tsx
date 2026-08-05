'use client';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { FaIcon } from '@/components/shared/FaIcon';

import { LANDING_CMS_TABS, type LandingCmsTab } from '../constants';

type LandingCmsSubTabsProps = {
  active: LandingCmsTab;
  onChange: (tab: LandingCmsTab) => void;
};

export function LandingCmsSubTabs({
  active,
  onChange,
}: LandingCmsSubTabsProps) {
  return (
    <div className="mb-kv-pair">
      <AppTabs
        value={active}
        onValueChange={(value) => onChange(value as LandingCmsTab)}
        gridCols={3}
      >
        <AppTabsList aria-label="بخش‌های مدیریت محتوای لندینگ">
          {LANDING_CMS_TABS.map((tab) => (
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
