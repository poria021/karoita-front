import {
  clampLevel,
  courseNameForKind,
  kindForRole,
} from '@/services/internship-enrollment/enrollment-mappers';
import {
  findRecord,
  isArchivedTerm,
  PLACEHOLDER_UNSET,
} from '@/services/internship-enrollment/mock-enrollment-helpers';
import {
  type WeekReportOverride,
  readSnapshot,
  writeSnapshot,
} from '@/services/internship-enrollment/mock-enrollment-persistence';
import {
  isAllowedWeeklyReportAttachment,
  WEEKLY_REPORT_MAX_FILE_SIZE_MB,
  WEEKLY_REPORT_MAX_TOTAL_SIZE_MB,
} from '@/services/internship-enrollment/weekly-report-attachment-limits';
import {
  APPRENTICESHIP_DEFAULT_WEEKS,
  INTERNSHIP_DEFAULT_WEEKS,
  readSyllabusSnapshot,
} from '@/services/syllabus-config/mock-syllabus-store';
import {
  buildCourseOfferingId,
  catalogIdForKind,
} from '@/services/syllabus-config/syllabus-mappers';
import type {
  InternshipCourseKind,
  InternshipEnrollmentLevel,
  InternshipEnrollmentRecord,
  InternshipEnrollmentSummary,
  InternshipProgressiveGrade,
  InternshipWeeklyReportFeedback,
  InternshipWeeklyReportFile,
  InternshipWeeklySession,
  InternshipWeeklySessionState,
  SaveWeeklyReportDraftInput,
  SubmitWeeklyReportInput,
} from '@/types/internship-enrollment';
import { normalizeEnrollmentCourseTitle } from '@/utils/enrollment-eligibility';

function statusForWeek(index: number): InternshipWeeklySessionState {
  const seededStates: InternshipWeeklySessionState[] = [
    'graded',
    'approved',
    'pending',
    'needs_edit',
    'extended',
    'overdue',
  ];
  return seededStates[index] ?? 'locked_future';
}

function weekReportKey(input: {
  userId: string;
  termId: string;
  kind: InternshipCourseKind;
  level: InternshipEnrollmentLevel;
  weekId: string;
}): string {
  return `${input.userId}:${input.termId}:${input.kind}:${input.level}:${input.weekId}`;
}

function seededFeedbackForStatus(
  status: InternshipWeeklySessionState
): InternshipWeeklyReportFeedback | undefined {
  if (status !== 'needs_edit' && status !== 'approved' && status !== 'graded') {
    return undefined;
  }
  return {
    advisor:
      status === 'needs_edit'
        ? 'لطفاً بخش فعالیت کلاسی را با جزئیات بیشتری تکمیل کنید و نمونه‌کار دانش‌آموزان را ضمیمه نمایید.'
        : 'گزارش شما بررسی شد و از نظر علمی قابل قبول است.',
    mentor:
      status === 'needs_edit'
        ? 'حضور در مدرسه ثبت شده؛ توضیحات بازخورد دانش‌آموزان را کامل‌تر بنویسید.'
        : undefined,
  };
}

function seededTextForStatus(status: InternshipWeeklySessionState): string {
  if (status === 'locked_future' || status === 'overdue' || status === 'extended') {
    return '';
  }
  if (status === 'draft') return '';
  return 'گزارش نمونهٔ هفته برای نمایش وضعیت در شبیه‌ساز mock.';
}

export function buildWeeklySessions(input: {
  kind: InternshipCourseKind;
  level: InternshipEnrollmentLevel;
  termId: string;
  userId: string;
}): InternshipWeeklySession[] {
  const syllabus = readSyllabusSnapshot();
  const offeringId = buildCourseOfferingId(
    input.termId,
    catalogIdForKind(input.kind, input.level)
  );
  const offering = syllabus.offerings[offeringId];
  /** After syllabus save: card count = rows of that course offering. */
  const defaultCount =
    input.kind === 'apprenticeship'
      ? APPRENTICESHIP_DEFAULT_WEEKS
      : INTERNSHIP_DEFAULT_WEEKS;
  const weeks =
    offering && offering.weeks && offering.weeks.length > 0
      ? offering.weeks
      : Array.from({ length: defaultCount }, (_, index) => ({
          id: `week-${index + 1}`,
          title: `هفته ${index + 1}`,
          suffix: String(index + 1),
          weight: 1,
          status: 'active' as const,
        }));

  const snapshot = readSnapshot();

  return weeks.map((week, index) => {
    const seededStatus: InternshipWeeklySessionState =
      week.status === 'archived' ? 'archived' : statusForWeek(index);
    const reportKey = weekReportKey({
      userId: input.userId,
      termId: input.termId,
      kind: input.kind,
      level: input.level,
      weekId: week.id,
    });
    const reports = snapshot.weekReports ?? {};
    const override = reportKey in reports ? reports[reportKey] : undefined;
    const status: InternshipWeeklySessionState =
      override?.status ?? seededStatus;
    const feedback = override?.feedback ?? seededFeedbackForStatus(status);
    const text = override?.text ?? seededTextForStatus(status);
    const files = override?.files ?? [];

    return {
      id: week.id,
      title: week.title || week.suffix || `هفته ${index + 1}`,
      status,
      score: status === 'graded' ? 92 : null,
      isExtended: status === 'extended' || seededStatus === 'extended',
      text,
      files,
      feedback,
    };
  });
}

function assertReportPayload(input: {
  text: string;
  files: InternshipWeeklyReportFile[];
}): void {
  const hasText = input.text.trim().length > 0;
  const hasFiles = input.files.length > 0;
  if (!hasText && !hasFiles) {
    throw new Error(
      'امکان ثبت گزارش خالی وجود ندارد. لطفاً متنی وارد کنید یا فایلی ضمیمه نمایید.'
    );
  }

  let totalMb = 0;
  for (const file of input.files) {
    if (!isAllowedWeeklyReportAttachment(file)) {
      throw new Error(
        `خطا: فرمت فایل "${file.name}" مجاز نیست. فقط PDF، TXT یا ZIP مجاز است.`
      );
    }
    if (!(file.sizeMb > 0) || file.sizeMb > WEEKLY_REPORT_MAX_FILE_SIZE_MB) {
      throw new Error(
        `خطا: حجم فایل "${file.name}" فراتر از سقف مجاز ${WEEKLY_REPORT_MAX_FILE_SIZE_MB} مگابایت است.`
      );
    }
    totalMb += file.sizeMb;
  }
  if (totalMb > WEEKLY_REPORT_MAX_TOTAL_SIZE_MB) {
    throw new Error(
      `خطا: مجموع حجم فایل‌های ضمیمه شده از سقف مجاز ${WEEKLY_REPORT_MAX_TOTAL_SIZE_MB} مگابایت عبور می‌کند.`
    );
  }
}

function writeWeekReport(
  input: SaveWeeklyReportDraftInput,
  nextStatus: WeekReportOverride['status']
): InternshipWeeklySession {
  const kind = kindForRole(input.actor.role);
  const level = clampLevel(kind, input.level);
  assertReportPayload(input);

  const snapshot = readSnapshot();
  const record = findRecord({
    snapshot,
    userId: input.actor.id,
    termId: input.termId,
    kind,
    level,
  });
  if (!record?.supervisorId) {
    throw new Error('رکورد ثبت‌نام برای ویرایش گزارش یافت نشد.');
  }
  if (
    record.status === 'dropped' ||
    record.status === 'completed' ||
    record.removalPending
  ) {
    throw new Error('امکان ویرایش گزارش این دوره وجود ندارد.');
  }

  const key = weekReportKey({
    userId: input.actor.id,
    termId: input.termId,
    kind,
    level,
    weekId: input.weekId,
  });
  const previous = snapshot.weekReports[key];
  const files = input.files.map((file) => ({
    id: file.id,
    name: file.name,
    sizeMb: Number(file.sizeMb.toFixed(2)),
    mimeType: file.mimeType,
  }));

  writeSnapshot({
    ...snapshot,
    weekReports: {
      ...snapshot.weekReports,
      [key]: {
        text: input.text,
        files,
        status: nextStatus,
        feedback: previous?.feedback,
      },
    },
  });

  const weeks = buildWeeklySessions({
    kind,
    level,
    termId: input.termId,
    userId: input.actor.id,
  });
  const week = weeks.find((item) => item.id === input.weekId);
  if (!week) {
    throw new Error('هفتهٔ گزارش یافت نشد.');
  }
  return week;
}

export function saveWeeklyReportDraft(
  input: SaveWeeklyReportDraftInput
): InternshipWeeklySession {
  return writeWeekReport(input, 'draft');
}

export function submitWeeklyReport(
  input: SubmitWeeklyReportInput
): InternshipWeeklySession {
  return writeWeekReport(input, 'pending');
}

export function buildProgressiveGrade(
  weeks: InternshipWeeklySession[]
): InternshipProgressiveGrade {
  const scoredWeeks = weeks.filter(
    (week) => week.status === 'graded' && week.score !== null
  );
  if (scoredWeeks.length === 0) {
    return { gradedCount: 0, final20: null };
  }

  const average =
    scoredWeeks.reduce((sum, week) => sum + (week.score ?? 0), 0) /
    scoredWeeks.length;
  return {
    gradedCount: scoredWeeks.length,
    final20: Number(((average / 100) * 20).toFixed(2)),
  };
}

export function buildEnrollmentSummary(input: {
  kind: InternshipCourseKind;
  level: InternshipEnrollmentLevel;
  termTitle: string;
  supervisorName: string | null;
  record: InternshipEnrollmentRecord | undefined;
  weeks: InternshipWeeklySession[];
}): InternshipEnrollmentSummary {
  const record = input.record;
  return {
    supervisorName: input.supervisorName,
    attendanceDaysLabel: record?.attendanceDaysLabel ?? PLACEHOLDER_UNSET,
    schoolId: record?.schoolId ?? null,
    schoolName: record?.schoolName ?? null,
    mentorId: record?.mentorId ?? null,
    mentorName: record?.mentorName ?? null,
    courseTitle: normalizeEnrollmentCourseTitle(
      courseNameForKind(input.kind),
      input.level
    ),
    termTitle: input.termTitle,
    status: record?.status ?? 'active',
    removalPending: Boolean(record?.removalPending),
    isTermArchived: isArchivedTerm(input.termTitle),
    weeks: input.weeks,
    progressiveGrade: buildProgressiveGrade(input.weeks),
  };
}
