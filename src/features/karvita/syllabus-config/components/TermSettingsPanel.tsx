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
  | 'isLoading'
  | 'isSaving'
  | 'termFormError'
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
  const isDataLoading = props.isLoading && props.terms.length === 0;

  return (
    <div className="flex w-full justify-center">
      <div className="grid w-full grid-cols-1 items-start gap-kv-group lg:max-w-5xl lg:grid-cols-12 xl:max-w-6xl">
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
            isSaving={props.isSaving}
            formError={props.termFormError}
            onSave={() => void props.saveTerm()}
            onRequestDelete={props.requestDeleteTerm}
            isLoading={isDataLoading}
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
            isLoading={isDataLoading}
          />
        </div>
      </div>
    </div>
  );
}
