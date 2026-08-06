'use client';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { FaIcon } from '@/components/shared/FaIcon';
import {
  KvSelect,
  KvSelectContent,
  KvSelectItem,
  KvSelectTrigger,
  KvSelectValue,
} from '@/components/shared/fields/KvSelect';
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
  termId: string;
  terms: Array<{ id: string; title: string }>;
  onChange: (value: DailyApprovalCourseKind) => void;
  onTermChange: (termId: string) => void;
};

export function DailyApprovalsCourseTabs({
  value,
  termId,
  terms,
  onChange,
  onTermChange,
}: DailyApprovalsCourseTabsProps) {
  return (
    <div className="flex flex-col items-stretch gap-kv-group border-b border-kv-border pb-kv-section sm:flex-row sm:items-center sm:justify-between">
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

      <div className="w-full shrink-0 sm:w-52">
        <KvSelect value={termId} onValueChange={onTermChange}>
          <KvSelectTrigger aria-label="نیم‌سال تحصیلی">
            <KvSelectValue placeholder="نیم‌سال تحصیلی" />
          </KvSelectTrigger>
          <KvSelectContent>
            {(terms ?? []).map((term) => (
              <KvSelectItem key={term.id} value={term.id}>
                {term.title}
              </KvSelectItem>
            ))}
          </KvSelectContent>
        </KvSelect>
      </div>
    </div>
  );
}
