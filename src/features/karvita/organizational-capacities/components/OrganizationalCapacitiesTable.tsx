'use client';

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

type OrganizationalCapacitiesTableProps = {
  courses: OrganizationalCapacityCourse[];
  maxCapacity: number;
  locked: boolean;
  resetKey: string;
  onTotalChange: (courseId: string, value: string) => void;
  onToggleDay: (courseId: string, day: OrganizationalCapacityWeekday) => void;
};

export function OrganizationalCapacitiesTable({
  courses,
  maxCapacity,
  locked,
  resetKey,
  onTotalChange,
  onToggleDay,
}: OrganizationalCapacitiesTableProps) {
  return (
    <KvTableViewport
      resetKey={resetKey}
      hasMore={false}
      isBusy={false}
      heightClassName="h-auto"
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
          {courses.map((course, index) => (
            <KvTableRow key={course.id}>
              <KvTableRowIndexCell index={index} />
              <KvTableCell emphasis>{course.title}</KvTableCell>
              <KvTableCell align="center">
                <OrganizationalCapacitiesTotalField
                  value={course.total}
                  maxCapacity={maxCapacity}
                  locked={locked}
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
                  onToggle={(day) => onToggleDay(course.id, day)}
                />
              </KvTableCell>
            </KvTableRow>
          ))}
        </KvTableBody>
      </KvTable>
    </KvTableViewport>
  );
}
