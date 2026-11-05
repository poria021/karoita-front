'use client';

import { useMemo, useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvTypography } from '@/components/shared/KvTypography';
import { KvBusySurface } from '@/components/shared/table/KvBusySurface';
import { cn } from '@/lib/utils';
import type {
  OrganizationalCapacityCourse,
  OrganizationalCapacityWeekday,
} from '@/types/organizational-capacities';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { groupCapacityCourses } from '../lib/groupCapacityCourses';
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
  const segments = useMemo(() => groupCapacityCourses(courses), [courses]);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  function toggleGroup(groupId: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  function renderCourse(course: OrganizationalCapacityCourse) {
    const expanded = expandedCourseId === course.id;
    const isCourseActive = course.isActive ?? true;
    const rowDisabled = locked || !isCourseActive;

    return (
      <KvCard
        key={course.id}
        tone="surface"
        padding="sm"
        className={cn(
          'border-kv-border/70 shadow-kv-soft transition-[border-color,box-shadow]',
          expanded && 'border-kv-brand-border ring-[3px] ring-kv-brand/15',
          !isCourseActive && 'opacity-70'
        )}
      >
        <KvCardContent padding="none" className="space-y-kv-group">
          <button
            type="button"
            className="flex w-full items-start gap-kv-group text-start"
            aria-expanded={expanded}
            onClick={() => onExpandedChange(expanded ? null : course.id)}
          >
            <div className="min-w-0 flex-1 space-y-kv-micro">
              <KvTypography variant="subtitle" as="h4" truncate>
                {course.title}
              </KvTypography>
              <KvTypography variant="caption" tone="muted">
                ظرفیت: {toPersianDigits(course.total ?? 0)} نفر • ثبت‌نام قطعی:{' '}
                {toPersianDigits(course.confirmed)} نفر
              </KvTypography>
            </div>
            <span
              aria-hidden
              className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-kv-control text-kv-text-faint"
            >
              <FaIcon
                icon={faIcons.chevronDown}
                size="2xs"
                className={cn(
                  'transition-transform',
                  expanded && 'rotate-180 text-kv-brand'
                )}
              />
            </span>
          </button>

          {expanded ? (
            <div className="border-t border-kv-border-muted pt-kv-group">
              <div className="flex items-center justify-center gap-kv-group rounded-kv-control bg-kv-surface-subtle p-kv-group">
                <div className="flex shrink-0 flex-col items-center gap-kv-micro">
                  <KvTypography
                    variant="caption"
                    tone="muted"
                    as="p"
                    className="whitespace-nowrap font-medium"
                  >
                    ظرفیت پذیرش
                  </KvTypography>
                  <OrganizationalCapacitiesTotalField
                    value={course.total}
                    maxCapacity={maxCapacity}
                    locked={rowDisabled}
                    onChange={(value) => onTotalChange(course.id, value)}
                  />
                </div>
                <div
                  className="h-10 w-px shrink-0 bg-kv-border-muted"
                  aria-hidden="true"
                />
                <div className="flex min-w-0 flex-col items-center gap-kv-micro">
                  <KvTypography
                    variant="caption"
                    tone="muted"
                    as="p"
                    className="font-medium"
                  >
                    روزهای حضور
                  </KvTypography>
                  <OrganizationalCapacitiesDayToggles
                    selectedDays={course.selectedDays}
                    disabled={rowDisabled}
                    onToggle={(day) => onToggleDay(course.id, day)}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </KvCardContent>
      </KvCard>
    );
  }

  if (isLoading) {
    return (
      <div className="lg:hidden">
        <KvCard className="border-kv-border/70 shadow-kv-soft">
          <KvBusySurface className="h-[16rem] min-h-[16rem] max-h-[16rem] rounded-kv-control" />
        </KvCard>
      </div>
    );
  }

  return (
    <div className="space-y-kv-group lg:hidden">
      {segments.map((segment) => {
        if (segment.kind === 'single') return renderCourse(segment.course);
        const isOpen = !collapsed.has(segment.groupId);
        const total =
          segment.summary.total === 'unlimited'
            ? 'نامحدود'
            : `${toPersianDigits(segment.summary.total)} نفر`;
        return (
          <KvCard
            key={segment.groupId}
            tone="surface"
            padding="sm"
            className="border-kv-border/70 shadow-kv-soft"
          >
            <KvCardContent padding="none" className="space-y-kv-group">
              <button
                type="button"
                className="flex w-full items-start gap-kv-group text-start"
                aria-expanded={isOpen}
                onClick={() => toggleGroup(segment.groupId)}
              >
                <div className="min-w-0 flex-1 space-y-kv-micro">
                  <span className="flex min-w-0 items-center gap-kv-pair">
                    <span
                      aria-hidden
                      className="size-1.5 shrink-0 rounded-full bg-kv-brand"
                    />
                    <KvTypography
                      variant="subtitle"
                      weight="black"
                      as="h4"
                      truncate
                    >
                      {segment.title}
                    </KvTypography>
                  </span>
                  <KvTypography variant="caption" tone="muted">
                    ظرفیت: {total} • ثبت‌نام قطعی:{' '}
                    {toPersianDigits(segment.summary.confirmed)} نفر
                  </KvTypography>
                </div>
                <FaIcon
                  icon={faIcons.chevronDown}
                  size="2xs"
                  className={cn(
                    'mt-1 shrink-0 transition-transform',
                    isOpen
                      ? 'rotate-180 text-kv-brand'
                      : 'text-kv-text-faint'
                  )}
                />
              </button>
              {isOpen ? (
                <div className="space-y-kv-group border-t border-kv-border-muted pt-kv-group">
                  {segment.items.map(({ course }) => renderCourse(course))}
                </div>
              ) : null}
            </KvCardContent>
          </KvCard>
        );
      })}
    </div>
  );
}
