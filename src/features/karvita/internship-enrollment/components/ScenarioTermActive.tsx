'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { FaIcon } from '@/components/shared/FaIcon';
import {
  KvSelect,
  KvSelectContent,
  KvSelectItem,
  KvSelectTrigger,
  KvSelectValue,
} from '@/components/shared/fields/KvSelect';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard } from '@/components/shared/KvCard';
import { KvTypography } from '@/components/shared/KvTypography';
import { KvBusySurface } from '@/components/shared/table/KvBusySurface';
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

function SuccessNotice({
  enrollment,
}: {
  enrollment: InternshipEnrollmentSummary;
}) {
  const isCompleted = enrollment.status === 'completed';
  const isArchived = enrollment.isTermArchived;
  if (!isCompleted && !isArchived) return null;

  const grade =
    enrollment.progressiveGrade.final20 === null
      ? '---'
      : toPersianDigits(enrollment.progressiveGrade.final20);
  const description = isCompleted
    ? `این درس در نیم‌سال ${toPersianDigits(enrollment.termTitle)} با نمره نهایی ${grade} از ۲۰ با موفقیت ثبت قطعی شده است.`
    : 'این نیم‌سال تحصیلی خاتمه یافته و پرونده دوره با موفقیت ثبت نهایی گردیده است. گزارش‌ها و نمرات ثبت‌شده شما در ادامه قابل دسترسی است.';

  return (
    <KvAlert
      variant="success"
      title="شما این ترم را با موفقیت به پایان رسانده‌اید"
      description={description}
    />
  );
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
        <span className="hidden text-kv-text-faint md:inline">|</span>
        <span className="flex w-full items-center justify-between gap-kv-inline sm:w-auto sm:justify-start">
          <span>نیم‌سال:</span>
          <strong className="rounded-kv-control border border-kv-border bg-kv-surface-muted px-2 py-0.5 text-xs font-bold text-kv-text">
            {toPersianDigits(enrollment.termTitle)}
          </strong>
        </span>
      </div>
    </div>
  );
}

/**
 * سلکت‌باکس نیم‌سال — همیشه نمایش داده می‌شود؛ وقتی تاریخچه فقط یک نیم‌سال
 * دارد دیزیبل است (که وجودش معلوم باشد)، و با دو یا چند نیم‌سال فعال می‌شود.
 */
function TermHistorySelect({
  termHistory,
  selectedTermId,
  onSelectTerm,
}: {
  termHistory: InternshipEnrollmentTermHistoryEntry[];
  selectedTermId: string;
  onSelectTerm: (termId: string) => void;
}) {
  if (termHistory.length === 0) return null;
  const isDisabled = termHistory.length <= 1;

  return (
    <div className="w-full sm:w-56">
      <KvSelect
        value={selectedTermId}
        onValueChange={onSelectTerm}
        disabled={isDisabled}
      >
        <KvSelectTrigger aria-label="نیم‌سال تحصیلی">
          <KvSelectValue placeholder="نیم‌سال تحصیلی" />
        </KvSelectTrigger>
        <KvSelectContent>
          {termHistory.map((term) => (
            <KvSelectItem key={term.termId} value={term.termId}>
              {toPersianDigits(term.termTitle)}
              {term.status === 'completed' ? ' (پایان‌یافته)' : ''}
              {term.status === 'dropped' ? ' (حذف‌شده)' : ''}
            </KvSelectItem>
          ))}
        </KvSelectContent>
      </KvSelect>
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

  if (!state.enrollment) {
    return (
      <KvAlert
        variant="error"
        title="جزئیات ثبت‌نام در دسترس نیست"
        description="رکورد ثبت‌نام برای این سطح یافت نشد."
      />
    );
  }

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

  if (isViewingHistory && !viewedEnrollment) {
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

  const enrollment = viewedEnrollment ?? state.enrollment;

  const suspended =
    !isViewingHistory &&
    (state.enrollment.status === 'dropped' || state.enrollment.removalPending);
  const showAssignment =
    !isViewingHistory &&
    (!state.enrollment.schoolId || state.enrollment.schoolId === '999') &&
    state.enrollment.status !== 'dropped';
  const reportTitle =
    enrollment.status === 'completed'
      ? 'گزارش هفتگی جلسات پاس‌شده'
      : enrollment.isTermArchived
        ? 'گزارش هفتگی جلسات'
        : 'گزارش هفتگی جلسات و نمرات مستمر';
  const grade =
    enrollment.progressiveGrade.final20 === null
      ? '---'
      : `${toPersianDigits(enrollment.progressiveGrade.final20)}/۲۰`;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-kv-group">
      {termSelect}
      <SuccessNotice enrollment={enrollment} />
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
              disabled={state.enrollment.removalPending}
              onAssignmentComplete={onAssignmentComplete}
            />
          ) : (
            <EnrollmentMeta enrollment={enrollment} />
          )}

          <div className="flex shrink-0 items-center justify-end">
            <div className="flex w-full flex-row items-center justify-between gap-kv-group rounded-kv-control border border-kv-border bg-kv-surface px-kv-group py-kv-field text-start shadow-kv-raised lg:w-auto lg:min-w-[260px]">
              <div className="flex flex-col gap-0.5 ps-kv-pair pe-kv-pair">
                <KvTypography
                  variant="caption"
                  tone="muted"
                  as="span"
                  weight="bold"
                >
                  {isViewingHistory ? 'کارنامه تحصیلی نیم‌سال' : 'کارنامه تحصیلی جاری'}
                </KvTypography>
                <KvTypography variant="caption" tone="muted" as="p">
                  وضعیت:{' '}
                  <span className="font-bold text-kv-text-secondary">
                    {enrollment.isTermArchived ? 'پایان‌یافته' : 'در جریان'}
                  </span>
                </KvTypography>
              </div>
              <Badge
                variant={
                  enrollment.progressiveGrade.gradedCount > 0
                    ? 'success'
                    : 'default'
                }
                className="font-sans font-bold"
              >
                نمره: {grade}
              </Badge>
            </div>
          </div>
        </div>
      </KvCard>

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
            دانلود کارنامه (PDF)
          </KvButton>
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
