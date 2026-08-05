'use client';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { FaIcon } from '@/components/shared/FaIcon';
import type { InternshipEnrollmentLevel } from '@/types/internship-enrollment';
import { toPersianDigits } from '@/utils/persianDigits';

import type { InternshipLevelTab } from '../constants';

type InternshipLevelTabsProps = {
  tabs: InternshipLevelTab[];
  active: InternshipEnrollmentLevel;
  onChange: (level: InternshipEnrollmentLevel) => void;
};

export function InternshipLevelTabs({
  tabs,
  active,
  onChange,
}: InternshipLevelTabsProps) {
  const gridCols = tabs.length <= 2 ? 2 : 4;

  const handleChange = (value: string) => {
    const parsed = Number(value);
    if (parsed === 1 || parsed === 2 || parsed === 3 || parsed === 4) {
      onChange(parsed);
    }
  };

  return (
    <div className="mb-kv-pair">
      <AppTabs
        value={String(active)}
        onValueChange={handleChange}
        gridCols={gridCols}
      >
        <AppTabsList aria-label="سطوح انتخاب واحد">
          {tabs.map((tab) => (
            <AppTabsTrigger key={tab.level} value={String(tab.level)}>
              <FaIcon icon={tab.icon} size="xs" />
              <span className="truncate">
                {toPersianDigits(tab.label)}
              </span>
            </AppTabsTrigger>
          ))}
        </AppTabsList>
      </AppTabs>
    </div>
  );
}
