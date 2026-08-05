'use client';

import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvSkeleton } from '@/components/shared/skeleton/KvSkeleton';
import {
  KvSkeletonCardHeader,
  KvSkeletonMetricCard,
} from '@/components/shared/skeleton/KvSkeletonCard';
import { KvSkeletonField } from '@/components/shared/skeleton/KvSkeletonField';

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

function TermSettingsDataSkeleton() {
  return (
    <div
      className="flex w-full justify-center"
      role="status"
      aria-busy="true"
      aria-label="در حال بارگذاری تنظیمات عمومی ترم‌ها"
    >
      <div className="grid w-full grid-cols-1 items-start gap-kv-group lg:max-w-5xl lg:grid-cols-12 xl:max-w-6xl">
        <div className="lg:col-span-7">
          <KvCard>
            <KvCardContent padding="md" className="space-y-kv-group">
              <KvSkeletonCardHeader
                className="gap-2.5 border-b border-kv-border pb-kv-pair"
                titleClassName="w-52"
                captionClassName="w-64"
              />

              <KvSkeletonField labelClassName="w-32" />
              <KvSkeletonField labelClassName="w-28" />

              <div className="grid grid-cols-1 gap-kv-group sm:grid-cols-2">
                <KvSkeletonField labelClassName="w-36" />
                <KvSkeletonField labelClassName="w-40" />
              </div>

              <div className="flex flex-col gap-2 border-t border-kv-border-muted pt-kv-group sm:flex-row sm:justify-end">
                <KvSkeleton className="h-11 w-full rounded-kv-control sm:w-44" />
              </div>
            </KvCardContent>
          </KvCard>
        </div>

        <div className="lg:col-span-5">
          <div className="grid grid-cols-1 gap-kv-group sm:grid-cols-2 lg:grid-cols-1">
            <KvSkeletonMetricCard />
            <KvSkeletonMetricCard />
          </div>
        </div>
      </div>
    </div>
  );
}

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
            academicYears={props.academicYears}
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
