'use client';

import { KvEmptyState } from '@/components/shared/KvEmptyState';
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
import { toPersianDigits } from '@/utils/persianDigits';

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
                description="پس از تعریف درس در سرفصل، ظرفیت اینجا نمایش داده می‌شود."
              />
            </KvTableEmpty>
          ) : (
            courses.map((course, index) => (
              <KvTableRow key={course.id}>
                <KvTableRowIndexCell index={index} />
                <KvTableCell emphasis>{course.title}</KvTableCell>
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
            ))
          )}
        </KvTableBody>
      </KvTable>
    </KvTableViewport>
  );
}
