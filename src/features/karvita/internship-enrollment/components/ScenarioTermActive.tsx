'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard } from '@/components/shared/KvCard';
import { KvTypography } from '@/components/shared/KvTypography';
import { KvBusySurface } from '@/components/shared/table/KvBusySurface';
import { CourseMaterialsLearnerBox } from '@/features/karvita/course-materials/components/CourseMaterialsLearnerBox';
import { evaluationCourseFilterId } from '@/services/syllabus-config/course-catalog';
import { catalogIdForKind } from '@/services/syllabus-config/syllabus-mappers';
import { IS_REAL_MODE_STUB_ACTIVE } from '@/components/shared/RealModeStubNotice';
import type {
  InternshipEnrollmentActor,
  InternshipEnrollmentPageState,
  InternshipEnrollmentSummary,
  InternshipEnrollmentTermHistoryEntry,
  InternshipWeeklySession,
} from '@/types/internship-enrollment';
import { toPersianDigits } from '@/utils/persianDigits';
import { faIcons } from '@/utils/iconMap';

import { DelayedSchoolMentorAssignment } from './DelayedSchoolMentorAssignment';
import { InternshipWeeklyGrid } from './InternshipWeeklyGrid';
import { TermHistorySelect } from './TermHistorySelect';
import { WeeklyReportModal } from './WeeklyReportModal';

type ScenarioTermActiveProps = {
  actor: InternshipEnrollmentActor;
  state: InternshipEnrollmentPageState;
  onAssignmentComplete: () => Promise<void>;
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
 * پیام پایان درس/نیم‌سال. «با موفقیت» فقط وقتی گفته می‌شود که بک‌اند قبولی را
 * صریحاً داده باشد (`outcome: 'passed'`)؛ `completed` به‌تنهایی یعنی ترم بسته
 * شده، نه قبولی.
 */
function CompletionNotice({
  enrollment,
}: {
  enrollment: InternshipEnrollmentSummary;
}) {
  const isCompleted = enrollment.status === 'completed';
  if (!isCompleted && !enrollment.isTermArchived) return null;

  const grade =
    enrollment.progressiveGrade.final20 === null
      ? '---'
      : toPersianDigits(enrollment.progressiveGrade.final20);
  const termTitle = toPersianDigits(enrollment.termTitle);

  if (!isCompleted) {
    return (
      <KvAlert
        variant="info"
        title="این نیم‌سال به پایان رسیده است"
        description="این نیم‌سال تحصیلی خاتمه یافته است. گزارش‌ها و نمرات ثبت‌شدهٔ شما در ادامه قابل دسترسی است."
      />
    );
  }

  if (enrollment.outcome === 'failed') {
    return (
      <KvAlert
        variant="error"
        title="این درس را در این نیم‌سال نگذرانده‌اید"
        description={`نمرهٔ نهایی شما در ${termTitle} به حد نصاب قبولی نرسید (نمره: ${grade} از ۲۰). برای گذراندن این درس باید آن را در نیم‌سال بعد دوباره انتخاب کنید.`}
      />
    );
  }

  if (enrollment.outcome === 'passed') {
    return (
      <KvAlert
        variant="success"
        title="شما این درس را با موفقیت گذرانده‌اید"
        description={`این درس در ${termTitle} با نمره نهایی ${grade} از ۲۰ با موفقیت ثبت قطعی شده است.`}
      />
    );
  }

  return (
    <KvAlert
      variant="info"
      title="این درس به پایان رسیده است"
      description={`پروندهٔ این درس در ${termTitle} با نمره نهایی ${grade} از ۲۰ ثبت قطعی شده است.`}
    />
  );
}

function outcomeLabel(enrollment: InternshipEnrollmentSummary): string {
  if (enrollment.outcome === 'passed') return 'قبول';
  if (enrollment.outcome === 'failed') return 'مردود';
  return enrollment.isTermArchived ? 'پایان‌یافته' : 'در جریان';
}

function EnrollmentMeta({
  enrollment,
}: {
  enrollment: InternshipEnrollmentSummary;
}) {
  return (
    <div className="flex min-w-0 flex-grow flex-col gap-kv-pair text-start text-xs font-medium text-kv-text-secondary">
      <div className="flex flex-wrap items-center gap-x-kv-group gap-y-kv-pair">
        <span className="flex w-full items-center justify-between gap-kv-inline sm:w-auto sm:justify-start">
          <span>استاد راهنما:</span>
          <strong className="rounded-kv-control border border-kv-border bg-kv-surface-muted px-2 py-0.5 text-xs font-bold text-kv-text">
            {enrollment.supervisorName ?? 'نامشخص'}
          </strong>
        </span>
        {enrollment.schoolName ? (
          <>
            <span className="hidden text-kv-text-faint md:inline">|</span>
            <span className="flex w-full items-center justify-between gap-kv-inline sm:w-auto sm:justify-start">
              <span>مدرسه همکار:</span>
              <strong className="rounded-kv-control border border-kv-border bg-kv-surface-muted px-2 py-0.5 text-xs font-bold text-kv-text">
                {enrollment.schoolName}
              </strong>
            </span>
          </>
        ) : null}
        {enrollment.mentorName ? (
          <>
            <span className="hidden text-kv-text-faint md:inline">|</span>
            <span className="flex w-full items-center justify-between gap-kv-inline sm:w-auto sm:justify-start">
              <span>معلم ناظر:</span>
              <strong className="rounded-kv-control border border-kv-border bg-kv-surface-muted px-2 py-0.5 text-xs font-bold text-kv-text">
                {enrollment.mentorName}
              </strong>
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function ScenarioTermActive({
  actor,
  state,
  onAssignmentComplete,
  onWeekUpdated,
  termHistory,
  selectedTermId,
  onSelectTerm,
  isViewingHistory,
  viewedEnrollment,
  isLoadingViewedTerm,
  viewedTermError,
}: ScenarioTermActiveProps) {
  const [activeWeek, setActiveWeek] = useState<InternshipWeeklySession | null>(
    null
  );

  const termSelect = (
    <TermHistorySelect
      termHistory={termHistory}
      selectedTermId={selectedTermId}
      onSelectTerm={onSelectTerm}
    />
  );

  if (isViewingHistory && isLoadingViewedTerm) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-kv-group">
        {termSelect}
        <KvCard padding="md" className="flex min-h-0 flex-1 flex-col">
          <KvBusySurface className="flex-1" />
        </KvCard>
      </div>
    );
  }

  if (isViewingHistory && viewedTermError) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-kv-group">
        {termSelect}
        <KvAlert
          variant="error"
          title="بارگذاری گزارش این نیم‌سال ناموفق بود"
          description={viewedTermError}
        />
      </div>
    );
  }

  // از S3 (هنوز ثبت‌نامی در ترم باز نیست) هم فقط برای مشاهدهٔ تاریخچه به اینجا
  // می‌رسیم، پس `state.enrollment` فقط وقتی لازم است که تاریخچه نمی‌بینیم.
  const current = state.enrollment;
  const enrollment = isViewingHistory ? viewedEnrollment : current;

  if (!enrollment && !isViewingHistory) {
    return (
      <KvAlert
        variant="error"
        title="جزئیات ثبت‌نام در دسترس نیست"
        description="رکورد ثبت‌نام برای این سطح یافت نشد."
      />
    );
  }

  if (!enrollment) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-kv-group">
        {termSelect}
        <KvAlert
          variant="info"
          title="گزارشی برای این نیم‌سال یافت نشد"
          description="رکورد ثبت‌نامی برای این نیم‌سال در دسترس نیست."
        />
      </div>
    );
  }

  const suspended =
    !isViewingHistory &&
    current !== null &&
    (current.status === 'dropped' || current.removalPending);
  const showAssignment =
    !isViewingHistory &&
    current !== null &&
    (!current.schoolId || current.schoolId === '999') &&
    current.status !== 'dropped';
  const reportTitle =
    enrollment.status === 'completed'
      ? enrollment.outcome === 'failed'
        ? 'گزارش هفتگی جلسات'
        : 'گزارش هفتگی جلسات پاس‌شده'
      : enrollment.isTermArchived
        ? 'گزارش هفتگی جلسات'
        : 'گزارش هفتگی جلسات و نمرات مستمر';
  const grade =
    enrollment.progressiveGrade.final20 === null
      ? '---'
      : `${toPersianDigits(enrollment.progressiveGrade.final20)}/۲۰`;

  const karnamehBox = (
    <div className="flex w-full flex-row items-center justify-between gap-kv-group rounded-kv-control border border-kv-border bg-kv-surface px-kv-group py-kv-field text-start shadow-kv-raised lg:w-auto lg:min-w-[260px]">
      <div className="flex flex-col gap-0.5 ps-kv-pair pe-kv-pair">
        <KvTypography variant="caption" tone="muted" as="span" weight="bold">
          {isViewingHistory ? 'کارنامه تحصیلی نیم‌سال' : 'کارنامه تحصیلی جاری'}
        </KvTypography>
        <KvTypography variant="caption" tone="muted" as="p">
          وضعیت:{' '}
          <span className="font-bold text-kv-text-secondary">
            {outcomeLabel(enrollment)}
          </span>
        </KvTypography>
      </div>
      <Badge
        variant={
          enrollment.outcome === 'failed'
            ? 'danger'
            : enrollment.progressiveGrade.gradedCount > 0
              ? 'success'
              : 'default'
        }
        className="font-sans font-bold"
      >
        نمره: {grade}
      </Badge>
    </div>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-kv-group">
      <CompletionNotice enrollment={enrollment} />
      {suspended ? (
        <KvAlert
          variant="error"
          title="شما از این کلاس آموزشی تعلیق و حذف شده‌اید!"
          description="دسترسی شما به این دوره به علت عدم حضور کلاسی تعلیق گردیده است. امکان ثبت گزارش جدید وجود ندارد اما تا تعیین تکلیف نهایی می‌توانید گزارش‌های ارسالی قبلی خود را ردیابی کنید."
        />
      ) : null}

      <KvCard padding="md" className="pb-kv-group">
        <div className="flex flex-col items-stretch justify-between gap-kv-group pb-kv-pair lg:flex-row lg:items-center">
          {showAssignment ? (
            <DelayedSchoolMentorAssignment
              actor={actor}
              state={state}
              supervisorName={enrollment.supervisorName ?? 'نامشخص'}
              disabled={current?.removalPending ?? false}
              onAssignmentComplete={onAssignmentComplete}
            />
          ) : (
            <EnrollmentMeta enrollment={enrollment} />
          )}

          <div className="flex shrink-0 items-center justify-end">
            {termSelect}
          </div>
        </div>
      </KvCard>

      {/* کلید درس هم‌تراز با فیلتر درس صفحهٔ ارزیابی استاد (`intern1` / leaf داینامیک). */}
      <CourseMaterialsLearnerBox
        kind={state.kind}
        courseKey={evaluationCourseFilterId(
          state.lessonId ?? catalogIdForKind(state.kind, state.level)
        )}
      />

      <KvCard padding="md" className="space-y-kv-group">
        <div className="flex flex-col justify-between gap-kv-field border-b border-kv-border pb-kv-group sm:flex-row sm:items-center">
          <div className="sm:text-sm">
            <KvTypography
              variant="title"
              weight="bold"
              as="h3"
            >
              {reportTitle}
            </KvTypography>
          </div>
          <div className="flex flex-col items-stretch gap-kv-group sm:flex-row sm:items-center">
            <KvButton
              type="button"
              color="error"
              appearance="solid"
              size="sm"
              icon={<FaIcon icon={faIcons.filePdf} size="sm" />}
              onClick={() =>
                toast.message('دریافت فایل PDF در نسخهٔ فعلی در دسترس نیست.')
              }
            >
              دانلود کارنامه
            </KvButton>
            {karnamehBox}
          </div>
        </div>

        {IS_REAL_MODE_STUB_ACTIVE && !enrollment.weeksAreReal ? (
          <KvAlert
            variant="error"
            title="فهرست هفته‌ها بارگذاری نشد"
            description="در خواندن هفته‌ها و نمرات این ثبت‌نام از سرور خطایی رخ داد؛ به این معنی نیست که گزارشی ثبت نشده. لطفاً صفحه را دوباره بارگذاری کنید."
          />
        ) : null}

        <InternshipWeeklyGrid
          weeks={enrollment.weeks}
          enrollmentStatus={enrollment.status}
          onWeekSelect={setActiveWeek}
        />
      </KvCard>

      <WeeklyReportModal
        open={Boolean(activeWeek)}
        week={activeWeek}
        actor={actor}
        state={{
          ...state,
          termId: isViewingHistory ? selectedTermId : state.termId,
          termTitle: enrollment.termTitle,
          enrollment,
        }}
        onClose={() => setActiveWeek(null)}
        onReopen={setActiveWeek}
        onWeekUpdated={onWeekUpdated}
      />
    </div>
  );
}
