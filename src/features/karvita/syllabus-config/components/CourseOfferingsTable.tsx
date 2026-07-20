'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import {
  KvTable,
  KvTableBody,
  KvTableCell,
  KvTableHead,
  KvTableHeader,
  KvTableRow,
} from '@/components/shared/table/KvTable';
import { getAdminTableBodyPhase } from '@/components/shared/table/adminTableBodyPhase';
import { KvTableBusy } from '@/components/shared/table/KvTableBusy';
import { KvTableEmpty } from '@/components/shared/table/KvTableEmpty';
import { KvTableViewport } from '@/components/shared/table/KvTableViewport';
import type { CourseCatalogItem } from '@/types/syllabus-config';
import { faIcons } from '@/utils/iconMap';

interface CourseOfferingsTableProps {
  courses: CourseCatalogItem[];
  selectedCourseId: string | null;
  offeredCatalogIds: Set<string>;
  isLoading: boolean;
  onSelectCourse: (course: CourseCatalogItem) => void;
  onToggleOffering: (course: CourseCatalogItem) => void;
}

export function CourseOfferingsTable({
  courses,
  selectedCourseId,
  offeredCatalogIds,
  isLoading,
  onSelectCourse,
  onToggleOffering,
}: CourseOfferingsTableProps) {
  const bodyPhase = getAdminTableBodyPhase(isLoading, courses.length);

  return (
    <KvTableViewport
      resetKey="course-offerings"
      isBusy={isLoading}
      hasMore={false}
      heightClassName="h-auto"
    >
      <KvTable scrollable={false}>
        <KvTableHeader>
          <KvTableRow>
            <KvTableHead>لیست دروس مجاز</KvTableHead>
            <KvTableHead align="center">وضعیت ارائه</KvTableHead>
          </KvTableRow>
        </KvTableHeader>
        <KvTableBody>
          {bodyPhase === 'busy' ? (
            <KvTableBusy colSpan={2} />
          ) : bodyPhase === 'empty' ? (
            <KvTableEmpty colSpan={2}>
              <KvEmptyState
                icon={<FaIcon icon={faIcons.rectangleList} size="lg" />}
                title="درسی برای این ترم تعریف نشده"
                description="ابتدا نوع ترم و دوره تحصیلی را در تنظیمات عمومی مشخص کنید."
              />
            </KvTableEmpty>
          ) : (
            courses.map((course) => {
              const offered = offeredCatalogIds.has(course.id);
              const selected = selectedCourseId === course.id;
              return (
                <KvTableRow
                  key={course.id}
                  interactive
                  selected={selected}
                  onClick={() => onSelectCourse(course)}
                >
                  <KvTableCell emphasis={selected}>{course.title}</KvTableCell>
                  <KvTableCell
                    align="center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <KvButton
                      type="button"
                      color={offered ? 'success' : 'error'}
                      size="sm"
                      className="h-7 min-h-7 px-2.5"
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
