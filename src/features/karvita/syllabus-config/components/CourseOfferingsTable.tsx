'use client';

import { KvButton } from '@/components/shared/KvButton';
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
import { KvTypography } from '@/components/shared/KvTypography';
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
      isBusy={isLoading}
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
            courses.map((course, index) => {
              const offered = offeredCatalogIds.has(course.id);
              const selected = selectedCourseId === course.id;
              return (
                <KvTableRow
                  key={course.id}
                  interactive
                  selected={selected}
                  onClick={() => onSelectCourse(course)}
                >
                  <KvTableRowIndexCell index={index} />
                  <KvTableCell emphasis={selected}>{course.title}</KvTableCell>
                  <KvTableCell
                    align="center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <KvButton
                      type="button"
                      color={offered ? 'success' : 'error'}
                      appearance="ghost"
                      size="xs"
                      loading={pendingCourseId === course.id}
                      disabled={Boolean(pendingCourseId)}
                      aria-pressed={offered}
                      aria-label={`وضعیت ارائه ${course.title}: ${offered ? 'فعال' : 'غیرفعال'}`}
                      onClick={() => onToggleOffering(course)}
                    >
                      {offered ? 'فعال' : 'غیرفعال'}
                    </KvButton>
                  </KvTableCell>
                </KvTableRow>
              );
            })
          )}
        </KvTableBody>
      </KvTable>
    </KvTableViewport>
  );
}
