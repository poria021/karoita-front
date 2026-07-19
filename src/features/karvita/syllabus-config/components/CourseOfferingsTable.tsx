'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvBadge } from '@/components/shared/KvBadge';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvSwitch } from '@/components/shared/fields/KvSwitch';
import {
  KvTable,
  KvTableBody,
  KvTableCell,
  KvTableHead,
  KvTableHeader,
  KvTableRow,
} from '@/components/shared/table/KvTable';
import { KvTableEmpty } from '@/components/shared/table/KvTableEmpty';
import { KvTableViewport } from '@/components/shared/table/KvTableViewport';
import type { CourseOfferingCatalogItem } from '@/types/syllabus-config';
import { faIcons } from '@/utils/iconMap';

interface CourseOfferingsTableProps {
  courses: CourseOfferingCatalogItem[];
  selectedCourseTitle: string | null;
  offeredTitles: Set<string>;
  isLoading: boolean;
  onSelectCourse: (course: CourseOfferingCatalogItem) => void;
  onToggleOffering: (course: CourseOfferingCatalogItem) => void;
}

export function CourseOfferingsTable({
  courses,
  selectedCourseTitle,
  offeredTitles,
  isLoading,
  onSelectCourse,
  onToggleOffering,
}: CourseOfferingsTableProps) {
  const isEmpty = !isLoading && courses.length === 0;

  return (
    <KvTableViewport
      resetKey="course-offerings"
      isBusy={isLoading}
      hasMore={false}
    >
      <KvTable scrollable={false}>
        <KvTableHeader>
          <KvTableRow>
            <KvTableHead>لیست دروس مجاز</KvTableHead>
            <KvTableHead align="center">وضعیت ارائه</KvTableHead>
          </KvTableRow>
        </KvTableHeader>
        <KvTableBody>
          {isLoading ? null : isEmpty ? (
            <KvTableEmpty colSpan={2}>
              <KvEmptyState
                icon={<FaIcon icon={faIcons.rectangleList} size="lg" />}
                title="درسی برای این ترم تعریف نشده"
                description="ابتدا نوع ترم و دوره تحصیلی را در تنظیمات عمومی مشخص کنید."
              />
            </KvTableEmpty>
          ) : (
            courses.map((course) => {
              const offered = offeredTitles.has(course.title);
              const selected = selectedCourseTitle === course.title;
              return (
                <KvTableRow
                  key={course.title}
                  interactive
                  selected={selected}
                  onClick={() => onSelectCourse(course)}
                >
                  <KvTableCell emphasis={selected}>{course.title}</KvTableCell>
                  <KvTableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <KvBadge variant={offered ? 'success' : 'default'}>
                        {offered ? 'باز' : 'بسته'}
                      </KvBadge>
                      <KvSwitch
                        size="sm"
                        checked={offered}
                        aria-label={`وضعیت ارائه ${course.title}`}
                        onCheckedChange={() => onToggleOffering(course)}
                      />
                    </div>
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
