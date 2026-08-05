'use client';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvBusySurface } from '@/components/shared/table/KvBusySurface';
import type { InternshipEnrollmentPageState } from '@/types/internship-enrollment';

import { ScenarioEnrollClosed } from './ScenarioEnrollClosed';
import { ScenarioRegisteredWaiting } from './ScenarioRegisteredWaiting';
import { ScenarioSyllabusBlocked } from './ScenarioSyllabusBlocked';

type InternshipEnrollmentGateProps = {
  state: InternshipEnrollmentPageState | null;
  isLoading: boolean;
};

/** ناحیهٔ داده — فقط اینجا busy می‌شود؛ تب‌ها بیرون می‌مانند. */
export function InternshipEnrollmentGate({
  state,
  isLoading,
}: InternshipEnrollmentGateProps) {
  if (isLoading && !state) {
    return <KvBusySurface className="min-h-48 rounded-kv-card" />;
  }

  if (!state) {
    return (
      <KvAlert
        variant="info"
        title="وضعیتی برای نمایش نیست"
        description="لطفاً سطح درس را دوباره انتخاب کنید."
      />
    );
  }

  switch (state.scenario) {
    case 'S1_syllabus_blocked':
      return <ScenarioSyllabusBlocked />;
    case 'S2_enroll_closed':
      return <ScenarioEnrollClosed weekCount={state.weekPreviewCount} />;
    case 'S4_registered_waiting':
      if (!state.enrollment) {
        return (
          <KvAlert
            variant="error"
            title="جزئیات ثبت‌نام در دسترس نیست"
            description="رکورد ثبت‌نام برای این سطح یافت نشد."
          />
        );
      }
      return <ScenarioRegisteredWaiting enrollment={state.enrollment} />;
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
