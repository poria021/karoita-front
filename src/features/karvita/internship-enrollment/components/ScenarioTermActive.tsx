'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvTypography } from '@/components/shared/KvTypography';
import { KvBusySurface } from '@/components/shared/table/KvBusySurface';
import { useLearnerMaterialsBadge } from '@/features/karvita/course-materials/hooks/useLearnerMaterialsBadge';
import { RouteService } from '@/services/route.service';
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

import { findNextActionableWeekId } from '../lib/weekly-report-lock';
import { DelayedSchoolMentorAssignment } from './DelayedSchoolMentorAssignment';
import { InternshipWeeklyGrid } from './InternshipWeeklyGrid';
import {
  PastTermsCard,
  type PastTermsStatusNotice,
} from './PastTermsCard';
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
 * متن وضعیت برای کارت سوابق — فقط وقتی `isPass`/`outcome` معلوم باشد.
 * رنگ باکس جداگانه از همان `outcome` ست می‌شود.
 */
function getCompletionStatusNotice(
  enrollment: InternshipEnrollmentSummary
): PastTermsStatusNotice | null {
  if (enrollment.outcome !== 'passed' && enrollment.outcome !== 'failed') {
    return null;
  }

  const grade =
    enrollment.progressiveGrade.final20 === null
      ? '---'
      : toPersianDigits(enrollment.progressiveGrade.final20.toFixed(2));
  const termTitle = toPersianDigits(enrollment.termTitle);

  if (enrollment.outcome === 'failed') {
    return {
      title: 'این درس را در این نیم‌سال نگذرانده‌اید',
      description: `نمرهٔ نهایی شما در ${termTitle} به حد نصاب قبولی نرسید (نمره: ${grade} از ۲۰). برای گذراندن این درس باید آن را در نیم‌سال بعد دوباره انتخاب کنید.`,
    };
  }

  return {
    title: 'شما این درس را با موفقیت گذرانده‌اید',
    description: `این درس در ${termTitle} با نمره نهایی ${grade} از ۲۰ با موفقیت ثبت قطعی شده است.`,
  };
}

function outcomeLabel(enrollment: InternshipEnrollmentSummary): string {
  if (enrollment.outcome === 'passed') return 'قبول';
  if (enrollment.outcome === 'failed') return 'مردود';
  return enrollment.status === 'completed' || enrollment.isTermArchived
    ? 'پایان‌یافته'
    : 'در جریان';
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex min-w-0 items-center gap-kv-pair">
      <KvTypography variant="caption" tone="muted" as="span">
        {label}:
      </KvTypography>
      <Badge variant="default">{value}</Badge>
    </span>
  );
}

function EnrollmentMeta({
  enrollment,
}: {
  enrollment: InternshipEnrollmentSummary;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-kv-group gap-y-kv-pair">
      <MetaItem
        label="استاد راهنما"
        value={enrollment.supervisorName ?? 'نامشخص'}
      />
      {enrollment.schoolName ? (
        <MetaItem label="مدرسه همکار" value={enrollment.schoolName} />
      ) : null}
      {enrollment.mentorName ? (
        <MetaItem label="معلم ناظر" value={enrollment.mentorName} />
      ) : null}
    </div>
  );
}

function GradeSummaryBox({
  enrollment,
  isViewingHistory,
}: {
  enrollment: InternshipEnrollmentSummary;
  isViewingHistory: boolean;
}) {
  const grade =
    enrollment.progressiveGrade.final20 === null
      ? '---'
      : `${toPersianDigits(enrollment.progressiveGrade.final20.toFixed(2))}/۲۰`;

  return (
    <div className="flex w-full flex-row items-center justify-between gap-kv-group rounded-kv-control bg-kv-surface-subtle px-kv-inline py-kv-pair text-start sm:w-auto sm:min-w-[15rem]">
      <div className="flex min-w-0 flex-col gap-0.5">
        <KvTypography
          variant="caption"
          tone="muted"
          as="span"
          className="font-bold tracking-wide"
        >
          {isViewingHistory ? 'کارنامه نیم‌سال' : 'کارنامه جاری'}
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
        className="font-sans"
      >
        نمره: {grade}
      </Badge>
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

  const courseKey = evaluationCourseFilterId(
    state.lessonId ?? catalogIdForKind(state.kind, state.level)
  );
  const materialsBadge = useLearnerMaterialsBadge(state.kind, courseKey);

  const selectedTermOutcome =
    termHistory.find((term) => term.termId === selectedTermId)?.outcome ?? null;

  const renderPastTermsCard = (
    options: {
      outcome?: InternshipEnrollmentSummary['outcome'];
      statusNotice?: PastTermsStatusNotice | null;
    } = {}
  ) => (
    <PastTermsCard
      terms={termHistory}
      selectedTermId={selectedTermId}
      onSelectTerm={onSelectTerm}
      outcome={options.outcome ?? selectedTermOutcome}
      statusNotice={options.statusNotice ?? null}
    />
  );

  if (isViewingHistory && isLoadingViewedTerm) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-kv-group">
        {renderPastTermsCard()}
        <KvCard padding="md" className="flex min-h-0 flex-1 flex-col">
          <KvBusySurface className="flex-1" />
        </KvCard>
      </div>
    );
  }

  if (isViewingHistory && viewedTermError) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-kv-group">
        {renderPastTermsCard()}
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
        {renderPastTermsCard()}
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
    current.status !== 'dropped' &&
    current.status !== 'completed' &&
    !current.isTermArchived;
  const reportTitle =
    enrollment.status === 'completed'
      ? enrollment.outcome === 'failed'
        ? 'گزارش هفتگی جلسات'
        : 'گزارش هفتگی جلسات پاس‌شده'
      : enrollment.isTermArchived
        ? 'گزارش هفتگی جلسات'
        : 'گزارش هفتگی جلسات و نمرات مستمر';
  const nextActionableWeekId = findNextActionableWeekId(
    enrollment.weeks,
    enrollment.status
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-kv-group">
      {renderPastTermsCard({
        outcome: enrollment.outcome ?? selectedTermOutcome,
        statusNotice: getCompletionStatusNotice(enrollment),
      })}
      {suspended ? (
        <KvAlert
          variant="error"
          title="شما از این کلاس آموزشی تعلیق و حذف شده‌اید!"
          description="دسترسی شما به این دوره به علت عدم حضور کلاسی تعلیق گردیده است. امکان ثبت گزارش جدید وجود ندارد اما تا تعیین تکلیف نهایی می‌توانید گزارش‌های ارسالی قبلی خود را ردیابی کنید."
        />
      ) : null}

      <KvCard padding="md">
        <div className="flex flex-col items-stretch justify-between gap-kv-group lg:flex-row lg:items-center">
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
          <GradeSummaryBox
            enrollment={enrollment}
            isViewingHistory={isViewingHistory}
          />
        </div>
      </KvCard>

      <KvCard
        tone="surface"
        padding="md"
        className="border-kv-border/70 shadow-kv-soft"
      >
        <KvCardContent padding="none" stacked>
          <div className="flex flex-col items-stretch justify-between gap-kv-group border-b border-kv-border-muted pb-kv-group sm:flex-row sm:items-center">
            <KvTypography variant="subtitle" weight="bold" as="h3">
              {reportTitle}
            </KvTypography>
            <div className="flex flex-col items-stretch gap-kv-pair sm:flex-row sm:items-center">
              <KvButton asChild color="cta" appearance="ghost" size="sm">
                <Link
                  href={RouteService.karvita.courseMaterials(state.level)}
                  prefetch
                >
                  <FaIcon icon={faIcons.folderOpen} size="sm" />
                  <span className="inline-flex items-center gap-kv-pair">
                    صندوق جزوات
                    {materialsBadge.hasNew ? (
                      <Badge variant="danger" className="px-1.5 py-0 text-[0.65rem]">
                        جزوه جدید
                        {materialsBadge.newCount > 1
                          ? ` (${toPersianDigits(materialsBadge.newCount)})`
                          : ''}
                      </Badge>
                    ) : null}
                  </span>
                </Link>
              </KvButton>
              <KvButton
                type="button"
                color="error"
                appearance="ghost"
                size="sm"
                icon={<FaIcon icon={faIcons.filePdf} size="sm" />}
                onClick={() =>
                  toast.message(
                    'دریافت فایل PDF در نسخهٔ فعلی در دسترس نیست.'
                  )
                }
              >
                دانلود کارنامه
              </KvButton>
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
            highlightWeekId={nextActionableWeekId}
            onWeekSelect={setActiveWeek}
          />
        </KvCardContent>
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
