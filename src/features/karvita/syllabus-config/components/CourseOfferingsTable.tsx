'use client';

import { memo } from 'react';

import { KvButton } from '@/components/shared/KvButton';
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
import { getAdminTableBodyPhase } from '@/components/shared/table/adminTableBodyPhase';
import { KvTableBusy } from '@/components/shared/table/KvTableBusy';
import { KvTableViewport } from '@/components/shared/table/KvTableViewport';
import { KvTypography } from '@/components/shared/KvTypography';
import { Spinner } from '@/components/ui/spinner';
import type { CourseCatalogItem } from '@/types/syllabus-config';

interface CourseOfferingsTableProps {
  courses: CourseCatalogItem[];
  selectedCourseId: string | null;
  offeredCatalogIds: Set<string>;
  isLoading: boolean;
  pendingCourseId?: string | null;
  onSelectCourse: (course: CourseCatalogItem) => void;
  onToggleOffering: (course: CourseCatalogItem) => void;
}

interface CourseOfferingsTableRowProps {
  course: CourseCatalogItem;
  index: number;
  offered: boolean;
  selected: boolean;
  pending: boolean;
  isLoading: boolean;
  hasPendingCourse: boolean;
  onSelectCourse: (course: CourseCatalogItem) => void;
  onToggleOffering: (course: CourseCatalogItem) => void;
}

const CourseOfferingsTableRow = memo(function CourseOfferingsTableRow({
  course,
  index,
  offered,
  selected,
  pending,
  isLoading,
  hasPendingCourse,
  onSelectCourse,
  onToggleOffering,
}: CourseOfferingsTableRowProps) {
  return (
    <KvTableRow
      interactive
      selected={selected}
      onClick={() => {
        if (!isLoading) onSelectCourse(course);
      }}
    >
      <KvTableRowIndexCell index={index} />
      <KvTableCell emphasis={selected}>{course.title}</KvTableCell>
      <KvTableCell align="center" onClick={(e) => e.stopPropagation()}>
        <KvButton
          type="button"
          color={offered ? 'success' : 'error'}
          appearance="ghost"
          size="xs"
          className="min-w-16"
          disabled={isLoading || hasPendingCourse}
          aria-pressed={offered}
          aria-busy={pending || undefined}
          aria-label={`وضعیت ارائه ${course.title}: ${offered ? 'فعال' : 'غیرفعال'}`}
          onClick={() => onToggleOffering(course)}
        >
          {pending ? (
            <Spinner className="size-3.5 text-current" aria-hidden="true" />
          ) : offered ? (
            'فعال'
          ) : (
            'غیرفعال'
          )}
        </KvButton>
      </KvTableCell>
    </KvTableRow>
  );
});

export function CourseOfferingsTable({
  courses,
  selectedCourseId,
  offeredCatalogIds,
  isLoading,
  pendingCourseId = null,
  onSelectCourse,
  onToggleOffering,
}: CourseOfferingsTableProps) {
  const bodyPhase = getAdminTableBodyPhase(isLoading, courses.length);

  return (
    <KvTableViewport
      resetKey="course-offerings"
      isBusy={isLoading && courses.length === 0}
      hasMore={false}
      heightClassName="h-full min-h-[240px]"
    >
      <KvTable scrollable={false}>
        <KvTableHeader>
          <KvTableRow>
            <KvTableRowIndexHead />
            <KvTableHead>لیست دروس مجاز</KvTableHead>
            <KvTableHead align="center">وضعیت ارائه</KvTableHead>
          </KvTableRow>
        </KvTableHeader>
        <KvTableBody>
          {bodyPhase === 'busy' ? (
            <KvTableBusy colSpan={3} />
          ) : bodyPhase === 'empty' ? (
            <KvTableEmpty colSpan={3}>
              <KvTypography variant="body" tone="muted">
                موردی یافت نشد
              </KvTypography>
            </KvTableEmpty>
          ) : (
            courses.map((course, index) => (
              <CourseOfferingsTableRow
                key={course.id}
                course={course}
                index={index}
                offered={offeredCatalogIds.has(course.id)}
                selected={selectedCourseId === course.id}
                pending={pendingCourseId === course.id}
                isLoading={isLoading}
                hasPendingCourse={Boolean(pendingCourseId)}
                onSelectCourse={onSelectCourse}
                onToggleOffering={onToggleOffering}
              />
            ))
          )}
        </KvTableBody>
      </KvTable>
    </KvTableViewport>
  );
}
