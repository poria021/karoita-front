'use client';

import dynamic from 'next/dynamic';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvCard } from '@/components/shared/KvCard';
import { KvBusySurface } from '@/components/shared/table/KvBusySurface';
import type {
  InternshipEnrollmentActor,
  InternshipEnrollmentPageState,
  InternshipEnrollmentSummary,
  InternshipEnrollmentTermHistoryEntry,
} from '@/types/internship-enrollment';

import { ScenarioEnrollClosed } from './ScenarioEnrollClosed';
import { ScenarioSyllabusBlocked } from './ScenarioSyllabusBlocked';

// سناریوهای سنگین‌تر lazy load می‌شوند — فقط یکی در هر بار رندر می‌شود
const ScenarioEnrollOpen = dynamic(
  () => import('./ScenarioEnrollOpen').then((m) => ({ default: m.ScenarioEnrollOpen })),
  { ssr: false }
);
const ScenarioRegisteredWaiting = dynamic(
  () => import('./ScenarioRegisteredWaiting').then((m) => ({ default: m.ScenarioRegisteredWaiting })),
  { ssr: false }
);
const ScenarioTermActive = dynamic(
  () => import('./ScenarioTermActive').then((m) => ({ default: m.ScenarioTermActive })),
  { ssr: false }
);
const ScenarioAlreadyEnrolled = dynamic(
  () => import('./ScenarioAlreadyEnrolled').then((m) => ({ default: m.ScenarioAlreadyEnrolled })),
  { ssr: false }
);

type InternshipEnrollmentGateProps = {
  actor: InternshipEnrollmentActor | null;
  state: InternshipEnrollmentPageState | null;
  isLoading: boolean;
  onEnrollmentComplete: () => Promise<void>;
  onEnrollmentCancel?: () => Promise<void>;
  termHistory: InternshipEnrollmentTermHistoryEntry[];
  selectedTermId: string;
  onSelectTerm: (termId: string) => void;
  isViewingHistory: boolean;
  viewedEnrollment: InternshipEnrollmentSummary | null;
  isLoadingViewedTerm: boolean;
  viewedTermError: string | null;
};

/** ناحیهٔ داده — پرکنندهٔ ارتفاع مین تا قبل از فوتر. */
export function InternshipEnrollmentGate({
  actor,
  state,
  isLoading,
  onEnrollmentComplete,
  onEnrollmentCancel,
  termHistory,
  selectedTermId,
  onSelectTerm,
  isViewingHistory,
  viewedEnrollment,
  isLoadingViewedTerm,
  viewedTermError,
}: InternshipEnrollmentGateProps) {
  if (isLoading) {
    return (
      <KvCard padding="md" className="flex min-h-0 flex-1 flex-col">
        <KvBusySurface className="flex-1" />
      </KvCard>
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
      return (
        <ScenarioRegisteredWaiting
          enrollment={state.enrollment}
          onCancel={onEnrollmentCancel}
        />
      );
    case 'S5_term_active':
      return actor ? (
        <ScenarioTermActive
          actor={actor}
          state={state}
          onAssignmentComplete={onEnrollmentComplete}
          termHistory={termHistory}
          selectedTermId={selectedTermId}
          onSelectTerm={onSelectTerm}
          isViewingHistory={isViewingHistory}
          viewedEnrollment={viewedEnrollment}
          isLoadingViewedTerm={isLoadingViewedTerm}
          viewedTermError={viewedTermError}
        />
      ) : (
        <KvAlert
          variant="error"
          title="حساب کاربری در دسترس نیست"
          description="لطفاً صفحه را دوباره بارگذاری کنید."
        />
      );
    case 'S6_already_enrolled_elsewhere':
      return state.conflictEnrollment ? (
        <ScenarioAlreadyEnrolled
          courseTitle={state.conflictEnrollment.courseTitle}
          termTitle={state.termTitle}
        />
      ) : (
        <KvAlert
          variant="info"
          title="در درس دیگری انتخاب واحد کرده‌اید"
          description="امکان شروع فعالیت در این ماژول وجود ندارد."
        />
      );
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
