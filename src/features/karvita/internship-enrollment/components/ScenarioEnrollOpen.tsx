'use client';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvCard } from '@/components/shared/KvCard';
import { useSupervisorSelectionWizard } from '@/features/karvita/internship-enrollment/hooks/useSupervisorSelectionWizard';
import type {
  InternshipEnrollmentActor,
  InternshipEnrollmentPageState,
} from '@/types/internship-enrollment';

import { SupervisorSelectionFilters } from './SupervisorSelectionFilters';
import { SupervisorSelectionMobileList } from './SupervisorSelectionMobileList';
import { SupervisorSelectionStart } from './SupervisorSelectionStart';
import { SupervisorSelectionTable } from './SupervisorSelectionTable';

type ScenarioEnrollOpenProps = {
  actor: InternshipEnrollmentActor;
  state: InternshipEnrollmentPageState;
  onEnrollmentComplete: () => Promise<void>;
};

/**
 * سناریوی ۳ — مرحلهٔ اول انتخاب واحد: انتخاب و رزرو استاد راهنما.
 * تخصیص مدرسه و معلم آگاهانه به Phase 3 واگذار شده است.
 */
export function ScenarioEnrollOpen({
  actor,
  state,
  onEnrollmentComplete,
}: ScenarioEnrollOpenProps) {
  const wizard = useSupervisorSelectionWizard({
    actor,
    state,
    onEnrollmentComplete,
  });

  if (!wizard.scope) {
    return (
      <KvAlert
        variant="error"
        title="حوزه انتخاب استاد در دسترس نیست"
        description="لطفاً صفحه را دوباره بارگذاری کنید."
      />
    );
  }

  if (!wizard.started) {
    return (
      <SupervisorSelectionStart
        wasDropped={state.selection?.wasDropped ?? false}
        droppedSupervisorName={state.selection?.droppedSupervisorName ?? null}
        onStart={wizard.start}
      />
    );
  }

  return (
    <KvCard
      padding="md"
      className="flex min-h-0 flex-1 flex-col gap-kv-group text-start"
    >
      <SupervisorSelectionFilters
        courseName={state.courseName}
        level={state.level}
        query={wizard.query}
        province={wizard.province}
        college={wizard.college}
        scope={wizard.scope}
        onQueryChange={wizard.setQuery}
        onProvinceChange={wizard.onProvinceChange}
        onCollegeChange={wizard.onCollegeChange}
      />

      <SupervisorSelectionTable
        supervisors={wizard.supervisors}
        isLoading={wizard.isLoading}
        submittingId={wizard.submittingId}
        onEnroll={wizard.enroll}
      />
      <SupervisorSelectionMobileList
        supervisors={wizard.supervisors}
        isLoading={wizard.isLoading}
        submittingId={wizard.submittingId}
        onEnroll={wizard.enroll}
      />
    </KvCard>
  );
}
