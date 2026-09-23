'use client';

import type { UseSyllabusConfigPageReturn } from '../hooks/useSyllabusConfigPage';
import { CourseOfferingsTable } from './CourseOfferingsTable';
import { TermGateCards, TermSemesterCard } from './TermStatusCards';
import { WeeklySyllabusTable } from './WeeklySyllabusTable';

type CourseOfferingsPanelProps = Pick<
  UseSyllabusConfigPageReturn,
  | 'audienceTerms'
  | 'selectedAudienceTerm'
  | 'audience'
  | 'changeAudience'
  | 'selectTerm'
  | 'toggleEnroll'
  | 'toggleTermOpen'
  | 'pendingEnroll'
  | 'pendingTermOpen'
  | 'pendingCourseId'
  | 'courses'
  | 'selectedCourse'
  | 'selectCourse'
  | 'offeredCatalogIds'
  | 'toggleCourseOffering'
  | 'weeks'
  | 'isWeeksPublished'
  | 'isLoading'
  | 'hasUnsavedChanges'
  | 'isSaving'
  | 'updateWeekWeight'
  | 'restoreWeek'
  | 'archiveWeek'
  | 'addWeek'
  | 'deleteWeek'
  | 'saveSyllabus'
>;

export function CourseOfferingsPanel(props: CourseOfferingsPanelProps) {
  const hasAudienceTerm = Boolean(props.selectedAudienceTerm);
  const courses = hasAudienceTerm ? props.courses : [];
  const weeks = hasAudienceTerm ? props.weeks : [];
  const selectedCourse = hasAudienceTerm ? props.selectedCourse : null;

  return (
    <div className="grid grid-cols-1 items-start gap-kv-section lg:grid-cols-12 lg:gap-kv-group">
      {/* ستون راست دسکتاپ RTL؛ موبایل/تبلت زیر گیت‌ها. */}
      <div className="order-2 flex flex-col gap-kv-group lg:order-1 lg:col-span-4 lg:row-span-2">
        <TermSemesterCard
          terms={props.audienceTerms}
          selectedTerm={props.selectedAudienceTerm}
          audience={props.audience}
          isLoading={props.isLoading}
          onAudienceChange={props.changeAudience}
          onSelectTerm={(termId) => props.selectTerm(termId)}
        />

        <CourseOfferingsTable
          courses={courses}
          selectedCourseId={selectedCourse?.id ?? null}
          offeredCatalogIds={props.offeredCatalogIds}
          isLoading={props.isLoading}
          pendingCourseId={props.pendingCourseId}
          onSelectCourse={props.selectCourse}
          onToggleOffering={props.toggleCourseOffering}
        />
      </div>

      <div className="order-1 lg:order-2 lg:col-span-8">
        <TermGateCards
          selectedTerm={props.selectedAudienceTerm}
          isLoading={props.isLoading}
          enrollPending={props.pendingEnroll}
          termOpenPending={props.pendingTermOpen}
          onToggleEnroll={(open) => void props.toggleEnroll(open)}
          onToggleTermOpen={(open) => void props.toggleTermOpen(open)}
        />
      </div>

      <div className="order-3 lg:order-3 lg:col-span-8">
        <WeeklySyllabusTable
          courseTitle={selectedCourse?.title ?? null}
          weeks={weeks}
          isWeeksPublished={hasAudienceTerm ? props.isWeeksPublished : false}
          isLoading={props.isLoading}
          hasUnsavedChanges={props.hasUnsavedChanges}
          isSaving={props.isSaving}
          onWeightChange={props.updateWeekWeight}
          onRestoreWeek={props.restoreWeek}
          onArchiveWeek={props.archiveWeek}
          onAddWeek={props.addWeek}
          onDeleteWeek={props.deleteWeek}
          onSave={() => void props.saveSyllabus()}
        />
      </div>
    </div>
  );
}
