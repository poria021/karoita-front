'use client';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { FaIcon } from '@/components/shared/FaIcon';
import type { DailyApprovalCourseKind } from '@/types/daily-approvals';
import { faIcons } from '@/utils/iconMap';

const COURSE_TABS: readonly {
  value: DailyApprovalCourseKind;
  label: string;
  icon: typeof faIcons.graduationCap;
}[] = [
  {
    value: 'internship',
    label: 'کارورزی دانشجویان (مدرسه محور)',
    icon: faIcons.graduationCap,
  },
  {
    value: 'apprenticeship',
    label: 'کارآموزی مهارت‌آموزان',
    icon: faIcons.userGear,
  },
];

type DailyApprovalsCourseTabsProps = {
  value: DailyApprovalCourseKind;
  onChange: (value: DailyApprovalCourseKind) => void;
};

export function DailyApprovalsCourseTabs({
  value,
  onChange,
}: DailyApprovalsCourseTabsProps) {
  return (
    <AppTabs
      value={value}
      gridCols={2}
      onValueChange={(nextValue) => {
        const tab = COURSE_TABS.find((item) => item.value === nextValue);
        if (tab) onChange(tab.value);
      }}
    >
      <AppTabsList aria-label="نوع دوره فراگیران">
        {COURSE_TABS.map((tab) => (
          <AppTabsTrigger key={tab.value} value={tab.value}>
            <FaIcon icon={tab.icon} size="xs" />
            {tab.label}
          </AppTabsTrigger>
        ))}
      </AppTabsList>
    </AppTabs>
  );
}
