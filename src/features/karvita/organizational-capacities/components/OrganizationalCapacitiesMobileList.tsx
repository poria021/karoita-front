'use client';

import { Badge } from '@/components/ui/badge';
import { FaIcon } from '@/components/shared/FaIcon';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvTypography } from '@/components/shared/KvTypography';
import type {
  OrganizationalCapacityCourse,
  OrganizationalCapacityWeekday,
} from '@/types/organizational-capacities';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { OrganizationalCapacitiesDayToggles } from './OrganizationalCapacitiesDayToggles';
import { OrganizationalCapacitiesTotalField } from './OrganizationalCapacitiesTotalField';

type OrganizationalCapacitiesMobileListProps = {
  courses: OrganizationalCapacityCourse[];
  maxCapacity: number;
  locked: boolean;
  expandedCourseId: string | null;
  onExpandedChange: (courseId: string | null) => void;
  onTotalChange: (courseId: string, value: string) => void;
  onToggleDay: (courseId: string, day: OrganizationalCapacityWeekday) => void;
};

export function OrganizationalCapacitiesMobileList({
  courses,
  maxCapacity,
  locked,
  expandedCourseId,
  onExpandedChange,
  onTotalChange,
  onToggleDay,
}: OrganizationalCapacitiesMobileListProps) {
  return (
    <div className="space-y-kv-group lg:hidden">
      {courses.map((course) => {
        const expanded = expandedCourseId === course.id;
        return (
          <KvCard key={course.id} tone="surface" padding="sm">
            <KvCardContent padding="none" className="space-y-kv-group">
              <button
                type="button"
                className="flex w-full items-start gap-kv-group text-start"
                onClick={() =>
                  onExpandedChange(expanded ? null : course.id)
                }
              >
                <div className="min-w-0 flex-1 space-y-kv-micro">
                  <div className="flex flex-wrap items-center gap-kv-pair">
                    <KvTypography variant="subtitle" as="h4" truncate>
                      {course.title}
                    </KvTypography>
                    <Badge variant="brand">
                      {toPersianDigits(course.selectedDays.length)} روز حضور
                    </Badge>
                  </div>
                  <KvTypography variant="caption" tone="muted">
                    ظرفیت معین: {toPersianDigits(course.total ?? 0)} نفر •
                    ثبت‌نام قطعی: {toPersianDigits(course.confirmed)} نفر
                  </KvTypography>
                </div>
                <FaIcon
                  icon={faIcons.chevronDown}
                  size="2xs"
                  className={
                    expanded
                      ? 'mt-1 shrink-0 rotate-180 text-kv-brand'
                      : 'mt-1 shrink-0 text-kv-text-faint'
                  }
                />
              </button>

              {expanded ? (
                <div className="space-y-kv-group border-t border-kv-border pt-kv-group">
                  <div className="space-y-kv-pair">
                    <KvTypography variant="caption" tone="muted" as="p">
                      تعیین ظرفیت پذیرش
                    </KvTypography>
                    <OrganizationalCapacitiesTotalField
                      value={course.total}
                      maxCapacity={maxCapacity}
                      locked={locked}
                      onChange={(value) => onTotalChange(course.id, value)}
                    />
                  </div>
                  <div className="space-y-kv-pair rounded-kv-control border border-kv-border bg-kv-surface-muted/50 p-kv-group">
                    <KvTypography variant="caption" tone="muted" as="p">
                      انتخاب روزهای پذیرش حضور کلاسی
                    </KvTypography>
                    <OrganizationalCapacitiesDayToggles
                      selectedDays={course.selectedDays}
                      disabled={locked}
                      onToggle={(day) => onToggleDay(course.id, day)}
                    />
                  </div>
                </div>
              ) : null}
            </KvCardContent>
          </KvCard>
        );
      })}
    </div>
  );
}
