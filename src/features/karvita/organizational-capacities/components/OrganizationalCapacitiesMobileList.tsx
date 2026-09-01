'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvTypography } from '@/components/shared/KvTypography';
import { KvBusySurface } from '@/components/shared/table/KvBusySurface';
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
  isLoading: boolean;
  expandedCourseId: string | null;
  onExpandedChange: (courseId: string | null) => void;
  onTotalChange: (courseId: string, value: string) => void;
  onToggleDay: (courseId: string, day: OrganizationalCapacityWeekday) => void;
};

export function OrganizationalCapacitiesMobileList({
  courses,
  maxCapacity,
  locked,
  isLoading,
  expandedCourseId,
  onExpandedChange,
  onTotalChange,
  onToggleDay,
}: OrganizationalCapacitiesMobileListProps) {
  if (isLoading) {
    return (
      <div className="lg:hidden">
        <KvCard>
          <KvBusySurface className="h-[16rem] min-h-[16rem] max-h-[16rem] rounded-kv-control" />
        </KvCard>
      </div>
    );
  }

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
                <div className="border-t border-kv-border pt-kv-group">
                  <div className="flex items-center justify-center gap-kv-group rounded-kv-control border border-kv-border bg-kv-surface-muted/50 p-kv-group">
                    <div className="flex shrink-0 flex-col items-center gap-kv-micro">
                      <KvTypography variant="caption" tone="muted" as="p" className="whitespace-nowrap">
                        ظرفیت پذیرش
                      </KvTypography>
                      <OrganizationalCapacitiesTotalField
                        value={course.total}
                        maxCapacity={maxCapacity}
                        locked={locked}
                        onChange={(value) => onTotalChange(course.id, value)}
                      />
                    </div>
                    <div className="h-10 w-px shrink-0 bg-kv-border" aria-hidden="true" />
                    <div className="flex min-w-0 flex-col items-center gap-kv-micro">
                      <KvTypography variant="caption" tone="muted" as="p">
                        روزهای حضور کلاسی
                      </KvTypography>
                      <OrganizationalCapacitiesDayToggles
                        selectedDays={course.selectedDays}
                        disabled={locked}
                        onToggle={(day) => onToggleDay(course.id, day)}
                      />
                    </div>
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
