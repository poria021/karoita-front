import {
  toDailyApprovalCatalogCourses,
} from '@/services/daily-approvals/daily-approval-catalog-mappers';
import { listRealCapacityCourses } from '@/services/organizational-capacities/real/real-organizational-capacities';
import { studentEnrollmentsApi } from '@/services/internship-enrollment/real/student-enrollments.api';
import { requireNestTransport } from '@/services/require-nest-transport';
import type {
  DailyApprovalCourseFilter,
  DailyApprovalProgressiveGrade,
  DailyApprovalTrainee,
  DailyApprovalTraineeStatus,
  ListDailyApprovalsInput,
  ListDailyApprovalsPage,
} from '@/types/daily-approvals';
import type { InternshipEnrollmentLevel } from '@/types/internship-enrollment';
import type {
  NestMentorStudent,
  NestMentorCapacity,
} from '@/types/nest-student-enrollments';
import type { NestStudentEnrollment } from '@/types/nest-student-enrollments';

function extractSchoolName(
  schoolId: NestStudentEnrollment['schoolId']
): string | null {
  if (!schoolId || typeof schoolId === 'string') return null;
  const record = schoolId as { title?: string; name?: string };
  return record.title ?? record.name ?? null;
}

const LEVEL_MAP: Record<
  Exclude<DailyApprovalCourseFilter, 'all'>,
  InternshipEnrollmentLevel
> = {
  intern1: 1,
  intern2: 2,
  intern3: 3,
  intern4: 4,
  appr1: 1,
  appr2: 2,
};

const EMPTY_GRADE: DailyApprovalProgressiveGrade = {
  gradedCount: 0,
  final20: null,
  statusLabel: 'در جریان',
};

function mapRow(
  row: NestMentorStudent,
  courseKey: Exclude<DailyApprovalCourseFilter, 'all'>,
  input: ListDailyApprovalsInput
): DailyApprovalTrainee {
  const id = row.id ?? row._id ?? row.studentId ?? '';
  const firstName = row.student?.firstName ?? '';
  const lastName = row.student?.lastName ?? '';
  const traineeName =
    [firstName, lastName].filter(Boolean).join(' ') || 'نامشخص';
  const status: DailyApprovalTraineeStatus =
    row.status === 'dropped' || row.status === 'cancelled' ? 'dropped' : 'active';

  return {
    id,
    traineeName,
    identifier: row.student?.phone ?? id,
    major: '',
    schoolName: extractSchoolName(row.schoolId),
    kind: input.kind,
    level: LEVEL_MAP[courseKey] ?? 1,
    courseKey,
    courseTitle: '',
    termId: input.termId,
    termTitle: '',
    status,
    unreadCount: 0,
    hasSubmitted: false,
    progressiveGrade: EMPTY_GRADE,
    weeks: [],
  };
}

/**
 * GET `/api/v1/student-enrollments/mentor/students`
 * لیست فراگیران منتور برای ماژول ارزیابی گزارش‌ها.
 * weekly report data (هفته‌ها / نمرات) تا وصل‌شدن endpoint مربوطه خالی می‌ماند.
 */
export async function listRealDailyApprovals(
  input: ListDailyApprovalsInput
): Promise<ListDailyApprovalsPage> {
  requireNestTransport('DailyApprovalsService.listPage');

  let lessonId: string | undefined;
  const courseKey: Exclude<DailyApprovalCourseFilter, 'all'> =
    input.course === 'all'
      ? input.kind === 'internship'
        ? 'intern1'
        : 'appr1'
      : input.course;

  if (input.course !== 'all') {
    try {
      const courses = await listRealCapacityCourses(input.kind, input.termId);
      const catalog = toDailyApprovalCatalogCourses(input.kind, courses);
      const matched = catalog.find((c) => c.courseFilter === input.course);
      lessonId = matched?.id;
    } catch {
      // بدون lessonId ادامه می‌دهیم؛ Nest همه درس‌های ترم را برمی‌گرداند
    }
  }

  const page =
    input.limit > 0 ? Math.floor(input.offset / input.limit) + 1 : 1;

  const result = await studentEnrollmentsApi.listMentorStudents({
    semesterId: input.termId,
    lessonId,
    page,
    limit: input.limit,
  });

  let trainees = result.data.map((row) => mapRow(row, courseKey, input));

  // فیلتر متنی — API جستجوی نام ندارد، سمت کلاینت اعمال می‌شود
  const q = input.query.trim().toLowerCase();
  if (q) {
    trainees = trainees.filter(
      (t) =>
        t.traineeName.toLowerCase().includes(q) ||
        t.identifier.toLowerCase().includes(q)
    );
  }

  // فیلتر وضعیت
  if (input.readFilter === 'dropped') {
    trainees = trainees.filter((t) => t.status === 'dropped');
  } else if (input.readFilter !== 'all') {
    trainees = trainees.filter((t) => t.status === 'active');
  }

  const base = input.offset + trainees.length;
  return {
    items: trainees,
    total: result.hasNextPage ? base + 1 : base,
    hasMore: result.hasNextPage,
    terms: [],
  };
}

/**
 * GET `/api/v1/student-enrollments/mentor/capacity`
 * ظرفیت کل / انتخاب‌شده / باقی‌مانده منتور برای یک ترم.
 */
export async function getRealDailyApprovalsMentorCapacity(
  semesterId: string
): Promise<NestMentorCapacity> {
  requireNestTransport('DailyApprovalsService.getMentorCapacity');
  return studentEnrollmentsApi.getMentorCapacity(semesterId);
}
