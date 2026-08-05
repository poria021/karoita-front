'use client';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvBusySurface } from '@/components/shared/table/KvBusySurface';
import type { InternshipEnrollmentPageState } from '@/types/internship-enrollment';

import { ScenarioEnrollClosed } from './ScenarioEnrollClosed';
import { ScenarioEnrollOpen } from './ScenarioEnrollOpen';
import { ScenarioRegisteredWaiting } from './ScenarioRegisteredWaiting';
import { ScenarioSyllabusBlocked } from './ScenarioSyllabusBlocked';

type InternshipEnrollmentGateProps = {
  state: InternshipEnrollmentPageState | null;
  isLoading: boolean;
};

/** ناحیهٔ داده — پرکنندهٔ ارتفاع مین تا قبل از فوتر. */
export function InternshipEnrollmentGate({
  state,
  isLoading,
}: InternshipEnrollmentGateProps) {
  if (isLoading) {
    return (
      <KvBusySurface className="min-h-0 flex-1 rounded-kv-card bg-kv-surface-subtle" />
    );
  }

  if (!state) {
    return (
      <KvAlert
        variant="info"
        title="وضعیتی برای نمایش نیست"
        description="لطفاً دوباره تلاش کنید."
      />
    );
  }

  switch (state.scenario) {
    case 'S1_syllabus_blocked':
      return <ScenarioSyllabusBlocked />;
    case 'S2_enroll_closed':
      return <ScenarioEnrollClosed />;
    case 'S3_enroll_open':
      return <ScenarioEnrollOpen />;
    case 'S4_registered_waiting':
      return <ScenarioRegisteredWaiting />;
    default:
      return (
        <KvAlert
          variant="warning"
          title="سناریوی پشتیبانی‌نشده"
          description="این وضعیت در فاز فعلی پیاده‌سازی نشده است."
        />
      );
  }
}
