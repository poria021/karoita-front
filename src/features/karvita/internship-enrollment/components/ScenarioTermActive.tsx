'use client';

import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard } from '@/components/shared/KvCard';
import { KvTypography } from '@/components/shared/KvTypography';
import type {
  InternshipEnrollmentActor,
  InternshipEnrollmentPageState,
} from '@/types/internship-enrollment';
import { toPersianDigits } from '@/utils/persianDigits';
import { faIcons } from '@/utils/iconMap';

import { DelayedSchoolMentorAssignment } from './DelayedSchoolMentorAssignment';
import { InternshipWeeklyGrid } from './InternshipWeeklyGrid';

type ScenarioTermActiveProps = {
  actor: InternshipEnrollmentActor;
  state: InternshipEnrollmentPageState;
  onAssignmentComplete: () => Promise<void>;
};

function SuccessNotice({
  state,
}: {
  state: InternshipEnrollmentPageState;
}) {
  const enrollment = state.enrollment;
  if (!enrollment) return null;
  const isCompleted = enrollment.status === 'completed';
  const isArchived = enrollment.isTermArchived;
  if (!isCompleted && !isArchived) return null;

  const grade =
    enrollment.progressiveGrade.final20 === null
      ? '---'
      : toPersianDigits(enrollment.progressiveGrade.final20);
  const description = isCompleted
    ? `این درس در نیم‌سال ${enrollment.termTitle} با نمره نهایی ${grade} از ۲۰ با موفقیت ثبت قطعی شده است.`
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
  state,
}: {
  state: InternshipEnrollmentPageState;
}) {
  const enrollment = state.enrollment;
  if (!enrollment) return null;

  return (
    <KvCard padding="md" className="space-y-kv-field">
      <div className="flex flex-wrap items-center justify-between gap-kv-pair">
        <KvTypography variant="subtitle" as="h2">
          اطلاعات دوره
        </KvTypography>
        <KvTypography variant="caption" tone="muted" as="span">
          {enrollment.termTitle}
        </KvTypography>
      </div>
      <div className="flex flex-wrap items-center gap-kv-pair">
        <Badge variant="brand">استاد راهنما: {enrollment.supervisorName ?? 'نامشخص'}</Badge>
        {enrollment.schoolName ? (
          <Badge variant="info">مدرسه همکار: {enrollment.schoolName}</Badge>
        ) : null}
        {enrollment.mentorName ? (
          <Badge variant="info">معلم ناظر: {enrollment.mentorName}</Badge>
        ) : null}
      </div>
    </KvCard>
  );
}

export function ScenarioTermActive({
  actor,
  state,
  onAssignmentComplete,
}: ScenarioTermActiveProps) {
  const enrollment = state.enrollment;
  if (!enrollment) {
    return (
      <KvAlert
        variant="error"
        title="جزئیات ثبت‌نام در دسترس نیست"
        description="رکورد ثبت‌نام برای این سطح یافت نشد."
      />
    );
  }

  const suspended =
    enrollment.status === 'dropped' || enrollment.removalPending;
  const showAssignment =
    (!enrollment.schoolId || enrollment.schoolId === '999') &&
    enrollment.status !== 'dropped';
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
      <SuccessNotice state={state} />
      {suspended ? (
        <KvAlert
          variant="error"
          title="شما از این کلاس آموزشی تعلیق و حذف شده‌اید!"
          description="دسترسی شما به این دوره به علت عدم حضور کلاسی تعلیق گردیده است. امکان ثبت گزارش جدید وجود ندارد اما تا تعیین تکلیف نهایی می‌توانید گزارش‌های ارسالی قبلی خود را ردیابی کنید."
        />
      ) : null}

      <EnrollmentMeta state={state} />

      {showAssignment ? (
        <DelayedSchoolMentorAssignment
          actor={actor}
          state={state}
          supervisorName={enrollment.supervisorName ?? 'نامشخص'}
          disabled={enrollment.removalPending}
          onAssignmentComplete={onAssignmentComplete}
        />
      ) : null}

      <KvCard padding="md" className="space-y-kv-group">
        <div className="flex flex-col justify-between gap-kv-field sm:flex-row sm:items-center">
          <div className="space-y-1">
            <KvTypography variant="subtitle" as="h3">
              کارنامه تحصیلی جاری
            </KvTypography>
            <KvTypography variant="caption" tone="muted" as="p">
              وضعیت: {enrollment.isTermArchived ? 'پایان‌یافته' : 'در جریان'}
            </KvTypography>
          </div>
          <Badge
            variant={
              enrollment.progressiveGrade.gradedCount > 0
                ? 'success'
                : 'default'
            }
          >
            نمره: {grade}
          </Badge>
        </div>

        <div className="flex flex-col justify-between gap-kv-field border-y border-kv-border py-kv-field sm:flex-row sm:items-center">
          <KvTypography variant="label" as="h3">
            {reportTitle}
          </KvTypography>
          <KvButton
            type="button"
            color="neutral"
            appearance="secondary"
            size="sm"
            icon={<FaIcon icon={faIcons.filePdf} size="sm" />}
            onClick={() =>
              toast.message('دریافت فایل PDF در نسخهٔ فعلی در دسترس نیست.')
            }
          >
            دانلود کارنامه (PDF)
          </KvButton>
        </div>

        <InternshipWeeklyGrid
          weeks={enrollment.weeks}
          enrollmentStatus={enrollment.status}
        />
      </KvCard>
    </div>
  );
}
