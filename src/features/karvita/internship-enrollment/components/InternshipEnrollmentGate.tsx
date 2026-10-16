'use client';

import dynamic from 'next/dynamic';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvCard } from '@/components/shared/KvCard';
import { KvTypography } from '@/components/shared/KvTypography';
import { KvBusySurface } from '@/components/shared/table/KvBusySurface';
import type {
  InternshipEnrollmentActor,
  InternshipEnrollmentPageState,
  InternshipEnrollmentSummary,
  InternshipEnrollmentTermHistoryEntry,
  InternshipWeeklySession,
} from '@/types/internship-enrollment';

import { ScenarioEnrollClosed } from './ScenarioEnrollClosed';
import { ScenarioSyllabusBlocked } from './ScenarioSyllabusBlocked';
import { TermHistorySelect } from './TermHistorySelect';

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
  onWeekUpdated: (week: InternshipWeeklySession) => void;
  termHistory: InternshipEnrollmentTermHistoryEntry[];
  selectedTermId: string;
  onSelectTerm: (termId: string) => void;
  isViewingHistory: boolean;
  viewedEnrollment: InternshipEnrollmentSummary | null;
  isLoadingViewedTerm: boolean;
  viewedTermError: string | null;
};

/**
 * کارت «سوابق نیم‌سال‌های قبل» بالای S3/S4 — دانشجوی مردود قبل از انتخاب واحد
 * دوباره (و تا شروع کلاس‌ها) گزارش و نمرهٔ ترم قبلش را از همین‌جا می‌بیند.
 */
function PastTermsCard({
  terms,
  selectedTermId,
  onSelectTerm,
}: {
  terms: InternshipEnrollmentTermHistoryEntry[];
  selectedTermId: string;
  onSelectTerm: (termId: string) => void;
}) {
  return (
    <KvCard padding="md">
      <div className="flex flex-col items-stretch justify-between gap-kv-group sm:flex-row sm:items-center">
        <div className="flex flex-col gap-kv-pair text-start">
          <KvTypography variant="subtitle" weight="bold" as="h3">
            سوابق نیم‌سال‌های قبل
          </KvTypography>
          <KvTypography variant="caption" tone="muted" as="p">
            برای مشاهدهٔ گزارش‌ها و نمرات، نیم‌سال موردنظر را انتخاب کنید.
          </KvTypography>
        </div>
        <TermHistorySelect
          termHistory={terms}
          selectedTermId={selectedTermId}
          onSelectTerm={onSelectTerm}
        />
      </div>
    </KvCard>
  );
}

/** ناحیهٔ داده — پرکنندهٔ ارتفاع مین تا قبل از فوتر. */
export function InternshipEnrollmentGate({
  actor,
  state,
  isLoading,
  onEnrollmentComplete,
  onEnrollmentCancel,
  onWeekUpdated,
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
    case 'S4_registered_waiting': {
      if (!actor) {
        return (
          <KvAlert
            variant="error"
            title="حساب کاربری در دسترس نیست"
            description="لطفاً صفحه را دوباره بارگذاری کنید."
          />
        );
      }

      // در S3 هنوز ردیفی برای ترم باز در تاریخچه نیست؛ گزینهٔ برگشت به آن را
      // خودمان اضافه می‌کنیم تا سلکت‌باکس بتواند به صفحهٔ انتخاب واحد برگردد.
      const hasPastTerms = termHistory.some((term) => term.termId !== state.termId);
      const selectableTerms = termHistory.some((term) => term.termId === state.termId)
        ? termHistory
        : [
            { termId: state.termId, termTitle: state.termTitle, status: 'active' as const },
            ...termHistory,
          ];

      if (isViewingHistory) {
        return (
          <ScenarioTermActive
            actor={actor}
            state={state}
            onAssignmentComplete={onEnrollmentComplete}
            onWeekUpdated={onWeekUpdated}
            termHistory={selectableTerms}
            selectedTermId={selectedTermId}
            onSelectTerm={onSelectTerm}
            isViewingHistory
            viewedEnrollment={viewedEnrollment}
            isLoadingViewedTerm={isLoadingViewedTerm}
            viewedTermError={viewedTermError}
          />
        );
      }

      let body;
      if (state.scenario === 'S3_enroll_open') {
        body = (
          <ScenarioEnrollOpen
            actor={actor}
            state={state}
            onEnrollmentComplete={onEnrollmentComplete}
          />
        );
      } else if (!state.enrollment) {
        body = (
          <KvAlert
            variant="error"
            title="جزئیات ثبت‌نام در دسترس نیست"
            description="رکورد ثبت‌نام برای این سطح یافت نشد."
          />
        );
      } else {
        body = (
          <ScenarioRegisteredWaiting
            enrollment={state.enrollment}
            onCancel={onEnrollmentCancel}
          />
        );
      }

      if (!hasPastTerms) return body;
      return (
        <div className="flex min-h-0 flex-1 flex-col gap-kv-group">
          <PastTermsCard
            terms={selectableTerms}
            selectedTermId={selectedTermId}
            onSelectTerm={onSelectTerm}
          />
          {body}
        </div>
      );
    }
    case 'S5_term_active':
      return actor ? (
        <ScenarioTermActive
          actor={actor}
          state={state}
          onAssignmentComplete={onEnrollmentComplete}
          onWeekUpdated={onWeekUpdated}
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
