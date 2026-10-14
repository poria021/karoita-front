'use client';

import { Fragment, memo, useMemo, useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
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
import { cn } from '@/lib/utils';
import type { CourseCatalogItem } from '@/types/syllabus-config';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

interface CourseOfferingsTableProps {
  courses: CourseCatalogItem[];
  selectedCourseId: string | null;
  offeredCatalogIds: Set<string>;
  isLoading: boolean;
  pendingCourseId?: string | null;
  onSelectCourse: (course: CourseCatalogItem) => void;
  onToggleOffering: (course: CourseCatalogItem) => void;
  /** وضعیت درخواست گروهی جاری (`true` فعال‌سازی، `false` توقف) یا `null`. */
  pendingBulkStatus?: boolean | null;
  /** `PATCH /admin/lessons/status` روی درس‌هایی که وضعیتشان باید عوض شود. */
  onSetAllOfferings?: (courses: CourseCatalogItem[], status: boolean) => void;
}

interface CourseOfferingsTableRowProps {
  course: CourseCatalogItem;
  index: number;
  offered: boolean;
  selected: boolean;
  pending: boolean;
  isLoading: boolean;
  hasPendingCourse: boolean;
  nested?: boolean;
  onSelectCourse: (course: CourseCatalogItem) => void;
  onToggleOffering: (course: CourseCatalogItem) => void;
}

/** درس مستقل یک ردیف است؛ زیرمجموعه‌های یک درس زیر یک سرگروه کشویی می‌آیند. */
type CourseOfferingSegment =
  | { kind: 'single'; course: CourseCatalogItem; index: number }
  | {
      kind: 'group';
      groupId: string;
      title: string;
      items: Array<{ course: CourseCatalogItem; index: number }>;
    };

function segmentCourses(courses: CourseCatalogItem[]): CourseOfferingSegment[] {
  const segments: CourseOfferingSegment[] = [];
  const groups = new Map<string, Extract<CourseOfferingSegment, { kind: 'group' }>>();
  courses.forEach((course, index) => {
    if (!course.groupId) {
      segments.push({ kind: 'single', course, index });
      return;
    }
    let group = groups.get(course.groupId);
    if (!group) {
      group = {
        kind: 'group',
        groupId: course.groupId,
        title: course.groupTitle ?? '',
        items: [],
      };
      groups.set(course.groupId, group);
      segments.push(group);
    }
    group.items.push({ course, index });
  });
  return segments;
}

const CourseOfferingsTableRow = memo(function CourseOfferingsTableRow({
  course,
  index,
  offered,
  selected,
  pending,
  isLoading,
  hasPendingCourse,
  nested = false,
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
      <KvTableCell emphasis={selected}>
        <span className={cn('block', nested && 'border-s-2 border-kv-brand/25 ps-3')}>
          {course.title}
        </span>
      </KvTableCell>
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
  pendingBulkStatus = null,
  onSetAllOfferings,
}: CourseOfferingsTableProps) {
  const bulkBusy = pendingBulkStatus !== null;
  const inactiveCourses = courses.filter((course) => !offeredCatalogIds.has(course.id));
  const activeCourses = courses.filter((course) => offeredCatalogIds.has(course.id));
  const bulkDisabled = isLoading || Boolean(pendingCourseId) || bulkBusy;
  const bodyPhase = getAdminTableBodyPhase(isLoading, courses.length);
  const segments = useMemo(() => segmentCourses(courses), [courses]);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    () => new Set()
  );

  function toggleGroup(groupId: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  function renderRow(course: CourseCatalogItem, index: number, nested = false) {
    return (
      <CourseOfferingsTableRow
        key={course.id}
        course={course}
        index={index}
        offered={offeredCatalogIds.has(course.id)}
        selected={selectedCourseId === course.id}
        pending={pendingCourseId === course.id}
        isLoading={isLoading}
        hasPendingCourse={Boolean(pendingCourseId) || bulkBusy}
        nested={nested}
        onSelectCourse={onSelectCourse}
        onToggleOffering={onToggleOffering}
      />
    );
  }

  return (
    <div className="flex h-full flex-col gap-kv-pair">
      {onSetAllOfferings && courses.length > 0 ? (
        <div
          role="toolbar"
          aria-label="عملیات گروهی ارائه دروس"
          className="flex flex-wrap items-center justify-between gap-kv-pair rounded-kv-control border border-kv-border bg-kv-surface-subtle/60 px-3 py-2"
        >
          <KvTypography variant="caption" tone="muted" as="span">
            {toPersianDigits(String(activeCourses.length))} از{' '}
            {toPersianDigits(String(courses.length))} درس فعال
          </KvTypography>
          <div className="flex items-center gap-1">
            <KvButton
              type="button"
              color="success"
              appearance="ghost"
              size="xs"
              disabled={bulkDisabled || inactiveCourses.length === 0}
              aria-busy={pendingBulkStatus === true || undefined}
              onClick={() => onSetAllOfferings(inactiveCourses, true)}
            >
              {pendingBulkStatus === true ? (
                <Spinner className="size-3.5 text-current" aria-hidden="true" />
              ) : (
                <FaIcon icon={faIcons.circleCheck} size="xs" />
              )}
              فعال‌سازی همه
            </KvButton>
            <KvButton
              type="button"
              color="error"
              appearance="ghost"
              size="xs"
              disabled={bulkDisabled || activeCourses.length === 0}
              aria-busy={pendingBulkStatus === false || undefined}
              onClick={() => onSetAllOfferings(activeCourses, false)}
            >
              {pendingBulkStatus === false ? (
                <Spinner className="size-3.5 text-current" aria-hidden="true" />
              ) : (
                <FaIcon icon={faIcons.circleXmark} size="xs" />
              )}
              توقف همه
            </KvButton>
          </div>
        </div>
      ) : null}
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
            segments.map((segment) => {
              if (segment.kind === 'single') {
                return renderRow(segment.course, segment.index);
              }
              const isOpen = !collapsedGroups.has(segment.groupId);
              const offeredCount = segment.items.filter(({ course }) =>
                offeredCatalogIds.has(course.id)
              ).length;
              return (
                <Fragment key={segment.groupId}>
                  <KvTableRow>
                    <KvTableCell colSpan={3} className="bg-kv-surface-subtle/70 p-0">
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
                          {toPersianDigits(String(offeredCount))} از{' '}
                          {toPersianDigits(String(segment.items.length))} فعال
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
    </div>
  );
}
