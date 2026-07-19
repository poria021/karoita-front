'use client';

import { KvCard } from '@/components/shared/KvCard';

import type { UseSyllabusConfigPageReturn } from '../hooks/useSyllabusConfigPage';
import { CourseOfferingsTable } from './CourseOfferingsTable';
import { TermStatusCards } from './TermStatusCards';
import { WeeklySyllabusTable } from './WeeklySyllabusTable';

type CourseOfferingsPanelProps = Pick<
  UseSyllabusConfigPageReturn,
  | 'terms'
  | 'selectedTerm'
  | 'selectTerm'
  | 'toggleEnroll'
  | 'toggleTermOpen'
  | 'courses'
  | 'selectedCourse'
  | 'selectCourse'
  | 'offeredTitles'
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
      <TermStatusCards
        terms={props.terms}
        selectedTerm={props.selectedTerm}
        onSelectTerm={(title) => void props.selectTerm(title)}
        onToggleEnroll={(open) => void props.toggleEnroll(open)}
        onToggleTermOpen={(open) => void props.toggleTermOpen(open)}
      />

      <div className="grid grid-cols-1 items-start gap-kv-group lg:grid-cols-12">
        <KvCard className="lg:col-span-4">
          <CourseOfferingsTable
            courses={props.courses}
            selectedCourseTitle={props.selectedCourse?.title ?? null}
            offeredTitles={props.offeredTitles}
            isLoading={props.isLoading}
            onSelectCourse={(course) => void props.selectCourse(course)}
            onToggleOffering={(course) => void props.toggleCourseOffering(course)}
          />
        </KvCard>

        <WeeklySyllabusTable
          className="lg:col-span-8"
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
    </div>
  );
}
