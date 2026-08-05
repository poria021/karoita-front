'use client';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvBusySurface } from '@/components/shared/table/KvBusySurface';
import type {
  InternshipEnrollmentActor,
  InternshipEnrollmentPageState,
} from '@/types/internship-enrollment';

import { ScenarioEnrollClosed } from './ScenarioEnrollClosed';
import { ScenarioEnrollOpen } from './ScenarioEnrollOpen';
import { ScenarioRegisteredWaiting } from './ScenarioRegisteredWaiting';
import { ScenarioSyllabusBlocked } from './ScenarioSyllabusBlocked';

type InternshipEnrollmentGateProps = {
  actor: InternshipEnrollmentActor | null;
  state: InternshipEnrollmentPageState | null;
  isLoading: boolean;
  onEnrollmentComplete: () => Promise<void>;
};

/** ناحیهٔ داده — پرکنندهٔ ارتفاع مین تا قبل از فوتر. */
export function InternshipEnrollmentGate({
  actor,
  state,
  isLoading,
  onEnrollmentComplete,
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
      return actor ? (
        <ScenarioEnrollOpen
          actor={actor}
          state={state}
          onEnrollmentComplete={onEnrollmentComplete}
        />
      ) : (
        <KvAlert
          variant="error"
          title="حساب کاربری در دسترس نیست"
          description="لطفاً صفحه را دوباره بارگذاری کنید."
        />
      );
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
