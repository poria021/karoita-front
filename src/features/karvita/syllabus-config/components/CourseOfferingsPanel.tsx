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
  | 'isSelectedCourseOffered'
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
    <div className="space-y-kv-section">
      <TermGateCards
        selectedTerm={props.selectedTerm}
        isLoading={props.isLoading}
        onToggleEnroll={(open) => void props.toggleEnroll(open)}
        onToggleTermOpen={(open) => void props.toggleTermOpen(open)}
      />

      <div className="grid grid-cols-1 items-stretch gap-kv-group lg:grid-cols-2">
        <TermSemesterCard
          terms={props.audienceTerms}
          selectedTerm={props.selectedAudienceTerm}
          audience={props.audience}
          isLoading={props.isLoading}
          onAudienceChange={props.changeAudience}
          onSelectTerm={(termId) => props.selectTerm(termId)}
        />

        <div className="min-h-[240px]">
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
      </div>

      <WeeklySyllabusTable
        courseTitle={props.selectedCourse?.title ?? null}
        weeks={props.weeks}
        isLoading={props.isLoading}
        courseOffered={props.isSelectedCourseOffered}
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
  );
}
