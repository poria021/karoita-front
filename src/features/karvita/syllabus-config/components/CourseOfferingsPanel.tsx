'use client';

import type { UseSyllabusConfigPageReturn } from '../hooks/useSyllabusConfigPage';
import { CourseOfferingsTable } from './CourseOfferingsTable';
import { TermGateCards, TermSemesterCard } from './TermStatusCards';
import { WeeklySyllabusTable } from './WeeklySyllabusTable';

type CourseOfferingsPanelProps = Pick<
  UseSyllabusConfigPageReturn,
  | 'audienceTerms'
  | 'selectedTerm'
  | 'selectedAudienceTerm'
  | 'audience'
  | 'changeAudience'
  | 'selectTerm'
  | 'toggleEnroll'
  | 'toggleTermOpen'
  | 'courses'
  | 'selectedCourse'
  | 'selectCourse'
  | 'offeredCatalogIds'
  | 'toggleCourseOffering'
  | 'weeks'
  | 'isLoading'
  | 'hasUnsavedChanges'
  | 'isSaving'
  | 'updateWeekWeight'
  | 'openWeekEdit'
  | 'restoreWeek'
  | 'archiveWeek'
  | 'addWeek'
  | 'requestDeleteWeek'
  | 'saveSyllabus'
>;

export function CourseOfferingsPanel(props: CourseOfferingsPanelProps) {
  return (
    <div className="grid grid-cols-1 items-start gap-kv-section lg:grid-cols-12 lg:gap-kv-group">
      <div className="flex flex-col gap-kv-group lg:col-span-4">
        <TermSemesterCard
          terms={props.audienceTerms}
          selectedTerm={props.selectedAudienceTerm}
          audience={props.audience}
          isLoading={props.isLoading}
          onAudienceChange={props.changeAudience}
          onSelectTerm={(termId) => props.selectTerm(termId)}
        />

        <CourseOfferingsTable
          courses={props.courses}
          selectedCourseId={props.selectedCourse?.id ?? null}
          offeredCatalogIds={props.offeredCatalogIds}
          isLoading={props.isLoading}
          onSelectCourse={(course) => void props.selectCourse(course)}
          onToggleOffering={(course) =>
            void props.toggleCourseOffering(course)
          }
        />
      </div>

      <div className="flex flex-col gap-kv-group lg:col-span-8">
        <TermGateCards
          selectedTerm={props.selectedTerm}
          isLoading={props.isLoading}
          onToggleEnroll={(open) => void props.toggleEnroll(open)}
          onToggleTermOpen={(open) => void props.toggleTermOpen(open)}
        />

        <WeeklySyllabusTable
          courseTitle={props.selectedCourse?.title ?? null}
          weeks={props.weeks}
          isLoading={props.isLoading}
          hasUnsavedChanges={props.hasUnsavedChanges}
          isSaving={props.isSaving}
          onWeightChange={props.updateWeekWeight}
          onEditWeek={props.openWeekEdit}
          onRestoreWeek={props.restoreWeek}
          onArchiveWeek={props.archiveWeek}
          onAddWeek={props.addWeek}
          onDeleteWeek={props.requestDeleteWeek}
          onSave={() => void props.saveSyllabus()}
        />
      </div>
    </div>
  );
}
