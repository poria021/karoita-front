'use client';

import { Fragment, useMemo, useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvTypography } from '@/components/shared/KvTypography';
import { getAdminTableBodyPhase } from '@/components/shared/table/adminTableBodyPhase';
import { KvTableBusy } from '@/components/shared/table/KvTableBusy';
import { KvTableEmpty } from '@/components/shared/table/KvTableEmpty';
import {
  KvTable,
  KvTableBody,
  KvTableCell,
  KvTableHead,
  KvTableHeader,
  KvTableRow,
} from '@/components/shared/table/KvTable';
import {
  KvTableRowIndexCell,
  KvTableRowIndexHead,
} from '@/components/shared/table/KvTableRowIndex';
import { KvTableViewport } from '@/components/shared/table/KvTableViewport';
import { cn } from '@/lib/utils';
import type {
  OrganizationalCapacityCourse,
  OrganizationalCapacityWeekday,
} from '@/types/organizational-capacities';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { groupCapacityCourses } from '../lib/groupCapacityCourses';
import { OrganizationalCapacitiesDayToggles } from './OrganizationalCapacitiesDayToggles';
import {
  CAPACITY_CONFIRMED_VALUE,
  OrganizationalCapacitiesTotalField,
} from './OrganizationalCapacitiesTotalField';

const COL_SPAN = 5;
/** ارتفاع ثابت و کوتاه‌تر از ویوپورت پیش‌فرض جداول ادمین. */
const TABLE_VIEWPORT_HEIGHT = 'h-[16rem] min-h-[16rem] max-h-[16rem]';
const TABLE_BODY_FILL_HEIGHT = 'min-h-[12.5rem]';

type OrganizationalCapacitiesTableProps = {
  courses: OrganizationalCapacityCourse[];
  maxCapacity: number;
  locked: boolean;
  isLoading: boolean;
  resetKey: string;
  onTotalChange: (courseId: string, value: string) => void;
  onToggleDay: (courseId: string, day: OrganizationalCapacityWeekday) => void;
};

export function OrganizationalCapacitiesTable({
  courses,
  maxCapacity,
  locked,
  isLoading,
  resetKey,
  onTotalChange,
  onToggleDay,
}: OrganizationalCapacitiesTableProps) {
  const bodyPhase = getAdminTableBodyPhase(isLoading, courses.length);
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

  function renderRow(
    course: OrganizationalCapacityCourse,
    index: number,
    nested = false
  ) {
    return (
      <KvTableRow key={course.id}>
        <KvTableRowIndexCell index={index} />
        <KvTableCell emphasis>
          <span
            className={cn(
              'block',
              nested && 'border-s-2 border-kv-brand/25 ps-3'
            )}
          >
            {course.title}
          </span>
        </KvTableCell>
        <KvTableCell align="center">
          <OrganizationalCapacitiesTotalField
            value={course.total}
            maxCapacity={maxCapacity}
            locked={locked}
            className="mx-auto"
            onChange={(value) => onTotalChange(course.id, value)}
          />
        </KvTableCell>
        <KvTableCell align="center">
          <span className={cn(CAPACITY_CONFIRMED_VALUE, 'mx-auto')}>
            {toPersianDigits(course.confirmed)} نفر
          </span>
        </KvTableCell>
        <KvTableCell align="center">
          <OrganizationalCapacitiesDayToggles
            selectedDays={course.selectedDays}
            disabled={locked}
            className="justify-center"
            onToggle={(day) => onToggleDay(course.id, day)}
          />
        </KvTableCell>
      </KvTableRow>
    );
  }

  return (
    <KvTableViewport
      resetKey={resetKey}
      hasMore={false}
      isBusy={isLoading && courses.length === 0}
      heightClassName={TABLE_VIEWPORT_HEIGHT}
    >
      <KvTable scrollable={false}>
        <KvTableHeader>
          <KvTableRow>
            <KvTableRowIndexHead />
            <KvTableHead>عنوان درس مجاز</KvTableHead>
            <KvTableHead align="center">ظرفیت پذیرش</KvTableHead>
            <KvTableHead align="center">ثبت‌نام قطعی</KvTableHead>
            <KvTableHead align="center">روزهای حضور متقابل</KvTableHead>
          </KvTableRow>
        </KvTableHeader>
        <KvTableBody>
          {bodyPhase === 'busy' ? (
            <KvTableBusy colSpan={COL_SPAN} fillClassName={TABLE_BODY_FILL_HEIGHT} />
          ) : bodyPhase === 'empty' ? (
            <KvTableEmpty colSpan={COL_SPAN} fillClassName={TABLE_BODY_FILL_HEIGHT}>
              <KvEmptyState
                title="درسی برای این دوره ثبت نشده"
                description="پس از تعریف درس در «تعریف دروس»، ظرفیت اینجا نمایش داده می‌شود."
              />
            </KvTableEmpty>
          ) : (
            segments.map((segment) => {
              if (segment.kind === 'single') {
                return renderRow(segment.course, segment.index);
              }
              const isOpen = !collapsed.has(segment.groupId);
              const total =
                segment.summary.total === 'unlimited'
                  ? 'نامحدود'
                  : `${toPersianDigits(segment.summary.total)} نفر`;
              return (
                <Fragment key={segment.groupId}>
                  <KvTableRow>
                    <KvTableCell
                      colSpan={COL_SPAN}
                      className="bg-kv-surface-subtle/70 p-0"
                    >
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-kv-pair px-3 py-2.5 text-start"
                        aria-expanded={isOpen}
                        onClick={() => toggleGroup(segment.groupId)}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <FaIcon
                            icon={isOpen ? faIcons.chevronUp : faIcons.chevronDown}
                            size="xs"
                            className="text-kv-text-faint"
                          />
                          <KvTypography variant="subtitle" weight="black" as="span" truncate>
                            {segment.title}
                          </KvTypography>
                        </span>
                        <KvTypography variant="caption" tone="muted" as="span">
                          ظرفیت: {total} • ثبت‌نام قطعی:{' '}
                          {toPersianDigits(segment.summary.confirmed)} نفر
                        </KvTypography>
                      </button>
                    </KvTableCell>
                  </KvTableRow>
                  {isOpen
                    ? segment.items.map(({ course, index }) =>
                        renderRow(course, index, true)
                      )
                    : null}
                </Fragment>
              );
            })
          )}
        </KvTableBody>
      </KvTable>
    </KvTableViewport>
  );
}
