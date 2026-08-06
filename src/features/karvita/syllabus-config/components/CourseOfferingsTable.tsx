'use client';

import Link from 'next/link';

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
import type { CourseCatalogItem } from '@/types/syllabus-config';
import {
  getModuleEmptyCopy,
  getSyllabusTermSettingsHref,
} from '@/utils/moduleDiscoverability';

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
  const emptyCopy = getModuleEmptyCopy('syllabus_courses');

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
              <KvEmptyState
                title={emptyCopy.title}
                description={emptyCopy.description}
                actions={
                  <KvButton
                    asChild
                    color="cta"
                    appearance="solid"
                    size="sm"
                  >
                    <Link
                      href={getSyllabusTermSettingsHref()}
                      prefetch={false}
                    >
                      {emptyCopy.actionLabel}
                    </Link>
                  </KvButton>
                }
              />
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
