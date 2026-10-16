'use client';

import { memo } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
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
import type { AcademicTermType, CourseDefinition } from '@/types/syllabus-config';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

const COL_SPAN = 4;

type CourseDefinitionsTableProps = {
  courses: CourseDefinition[];
  audience: AcademicTermType;
  isLoading: boolean;
  onAdd: () => void;
  onEdit: (course: CourseDefinition) => void;
  onDelete: (course: CourseDefinition) => void;
  onToggleArchive: (course: CourseDefinition) => void;
};

type RowProps = {
  course: CourseDefinition;
  index: number;
  onEdit: (course: CourseDefinition) => void;
  onDelete: (course: CourseDefinition) => void;
  onToggleArchive: (course: CourseDefinition) => void;
};

const CourseDefinitionRow = memo(function CourseDefinitionRow({
  course,
  index,
  onEdit,
  onDelete,
  onToggleArchive,
}: RowProps) {
  const subCount = course.subModules.length;
  return (
    <KvTableRow>
      <KvTableRowIndexCell index={index} />
      <KvTableCell emphasis>
        {toPersianDigits(course.title)}
        {course.isActive ? null : (
          <span className="ms-2 text-xs font-normal text-kv-text-muted">
            (بایگانی‌شده)
          </span>
        )}
      </KvTableCell>
      <KvTableCell align="center">
        {subCount > 0 ? toPersianDigits(String(subCount)) : '—'}
      </KvTableCell>
      <KvTableCell align="center">
        <div className="flex items-center justify-center gap-1.5">
          <KvButton
            type="button"
            color="neutral"
            appearance="ghost"
            size="icon-xs"
            aria-label={`ویرایش ${course.title}`}
            onClick={() => onEdit(course)}
            icon={<FaIcon icon={faIcons.penToSquare} size="xs" />}
          />
          <KvButton
            type="button"
            color="neutral"
            appearance="ghost"
            size="xs"
            onClick={() => onToggleArchive(course)}
          >
            {course.isActive ? 'بایگانی' : 'بازیابی'}
          </KvButton>
          <KvButton
            type="button"
            color="error"
            appearance="ghost"
            size="icon-xs"
            aria-label={`حذف ${course.title}`}
            onClick={() => onDelete(course)}
            icon={<FaIcon icon={faIcons.trashCan} size="xs" />}
          />
        </div>
      </KvTableCell>
    </KvTableRow>
  );
});

export function CourseDefinitionsTable({
  courses,
  audience,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
  onToggleArchive,
}: CourseDefinitionsTableProps) {
  const bodyPhase = getAdminTableBodyPhase(isLoading, courses.length);

  return (
    <KvTableViewport resetKey={audience} hasMore={false} isBusy={isLoading}>
      <KvTable scrollable={false}>
        <KvTableHeader>
          <KvTableRow>
            <KvTableRowIndexHead />
            <KvTableHead>عنوان درس</KvTableHead>
            <KvTableHead align="center">تعداد زیرمجموعه</KvTableHead>
            <KvTableHead align="center">عملیات</KvTableHead>
          </KvTableRow>
        </KvTableHeader>
        <KvTableBody>
          {bodyPhase === 'busy' ? (
            <KvTableBusy colSpan={COL_SPAN} />
          ) : bodyPhase === 'empty' ? (
            <KvTableEmpty colSpan={COL_SPAN}>
              <KvEmptyState
                title="درسی برای این پنل تعریف نشده است"
                description="با «افزودن درس» اولین درس را بسازید."
                actions={
                  <KvButton
                    type="button"
                    color="cta"
                    appearance="solid"
                    size="sm"
                    onClick={onAdd}
                    icon={<FaIcon icon={faIcons.plus} size="xs" />}
                  >
                    افزودن درس
                  </KvButton>
                }
              />
            </KvTableEmpty>
          ) : (
            courses.map((course, index) => (
              <CourseDefinitionRow
                key={course.id}
                course={course}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleArchive={onToggleArchive}
              />
            ))
          )}
        </KvTableBody>
      </KvTable>
    </KvTableViewport>
  );
}
