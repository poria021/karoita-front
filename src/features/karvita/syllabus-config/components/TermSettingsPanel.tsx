'use client';

import type { UseSyllabusConfigPageReturn } from '../hooks/useSyllabusConfigPage';
import { GlobalSettingsCards } from './GlobalSettingsCards';
import { TermFormCard } from './TermFormCard';

type TermSettingsPanelProps = Pick<
  UseSyllabusConfigPageReturn,
  | 'terms'
  | 'editTermId'
  | 'selectEditTerm'
  | 'termType'
  | 'onTermTypeChange'
  | 'termPrefix'
  | 'setTermPrefix'
  | 'termYear'
  | 'setTermYear'
  | 'academicYears'
  | 'isSaving'
  | 'saveTerm'
  | 'requestDeleteTerm'
  | 'professorCapacity'
  | 'setProfessorCapacity'
  | 'saveProfessorCapacity'
  | 'passingThreshold'
  | 'setPassingThreshold'
  | 'savePassingThreshold'
>;

export function TermSettingsPanel(props: TermSettingsPanelProps) {
  return (
    <div className="grid w-full grid-cols-1 items-start gap-kv-group lg:grid-cols-12">
      <div className="lg:col-span-7">
        <TermFormCard
          terms={props.terms}
          editTermId={props.editTermId}
          onSelectEditTerm={props.selectEditTerm}
          termType={props.termType}
          onTermTypeChange={props.onTermTypeChange}
          termPrefix={props.termPrefix}
          onTermPrefixChange={props.setTermPrefix}
          termYear={props.termYear}
          onTermYearChange={props.setTermYear}
          academicYears={props.academicYears}
          isSaving={props.isSaving}
          onSave={() => void props.saveTerm()}
          onRequestDelete={props.requestDeleteTerm}
        />
      </div>
      <div className="lg:col-span-5">
        <GlobalSettingsCards
          professorCapacity={props.professorCapacity}
          onProfessorCapacityChange={props.setProfessorCapacity}
          onSaveProfessorCapacity={() => void props.saveProfessorCapacity()}
          passingThreshold={props.passingThreshold}
          onPassingThresholdChange={props.setPassingThreshold}
          onSavePassingThreshold={() => void props.savePassingThreshold()}
        />
      </div>
    </div>
  );
}
