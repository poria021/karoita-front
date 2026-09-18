import { isMockApiMode, isRealApiMode } from '@/lib/api-mode';
import { delayMockAdminListPage } from '@/lib/mock-admin-list-delay';
import { listRealCapacityCourses, listRealCapacityTerms } from '@/services/organizational-capacities/real/real-organizational-capacities';
import {
  toDailyApprovalCatalogCourses,
  toDailyApprovalWeekOptions,
} from '@/services/daily-approvals/daily-approval-catalog-mappers';
import {
  bulkExtendMockDailyApprovalWeeks,
  dropMockDailyApprovalTrainee,
  extendMockDailyApprovalWeek,
  listMockDailyApprovalCourses,
  listMockDailyApprovalWeeks,
  listMockDailyApprovals,
  listTermsForDailyApprovalKind,
  markMockWeekRead,
  restoreMockDailyApprovalTrainee,
  updateMockDailyApprovalWeek,
  updateMockMentorDailyApprovalWeek,
  updateMockPrincipalDailyApprovalWeek,
} from '@/services/daily-approvals/mock/mock-daily-approvals-store';
import {
  assertDailyApprovalsMutationReady,
  dropRealDailyApprovalTrainee,
  markRealDailyApprovalWeekOpened,
  scoreRealDailyApprovalWeek,
  submitMentorFeedbackReal,
  submitPrincipalFeedbackReal,
} from '@/services/daily-approvals/real/real-daily-approvals-mutations';
import {
  getRealDailyApprovalsMentorCapacity,
  listRealDailyApprovals,
  loadRealDailyApprovalWeekDetail,
} from '@/services/daily-approvals/real/real-daily-approvals-reads';
import {
  getRealAcademicSettings,
  getRealWeeksForLesson,
} from '@/services/syllabus-config/real/real-syllabus-reads';
import { readDailyApprovalPassingScoreThreshold } from '@/services/syllabus-config/mock/mock-syllabus-daily-approvals-reads';
import {
  assertMockClientHasPermission,
  MOCK_AUTHZ_DENIED,
} from '@/services/mock/mock-authz';
import { useUserStore } from '@/store/useUserStore';
import type { UserRole } from '@/types/auth';
import type { NestMentorCapacity } from '@/types/nest-student-enrollments';
import type {
  BulkExtendDailyApprovalWeeksInput,
  BulkExtendDailyApprovalWeeksResult,
  DailyApprovalCatalogCourse,
  DailyApprovalCourseFilter,
  DailyApprovalCourseKind,
  DailyApprovalTrainee,
  DailyApprovalWeekDetail,
  DailyApprovalWeekOption,
  DropDailyApprovalTraineeInput,
  ExtendDailyApprovalWeekInput,
  ListDailyApprovalsInput,
  ListDailyApprovalsPage,
  UpdateDailyApprovalWeekInput,
  UpdateMentorDailyApprovalWeekInput,
  UpdatePrincipalDailyApprovalWeekInput,
} from '@/types/daily-approvals';
import { DEFAULT_PAGE_LIMIT } from '@/utils/offset-limit-page';

export const DAILY_APPROVALS_PAGE_SIZE = DEFAULT_PAGE_LIMIT;

const REVIEW_ROLES = new Set<UserRole>([
  'supervisor_professor',
  'mentor_teacher',
  'school_principal',
]);

function requireDailyApprovalsReview(): void {
  if (isRealApiMode()) {
    assertDailyApprovalsMutationReady('DailyApprovalsService');
  }
  assertMockClientHasPermission('daily-approval.review');
  const actor = useUserStore.getState().activeUser;
  if (!actor || !REVIEW_ROLES.has(actor.role)) {
    throw new Error(MOCK_AUTHZ_DENIED);
  }
}

function requireReviewRole(role: UserRole): void {
  requireDailyApprovalsReview();
  const actor = useUserStore.getState().activeUser;
  if (!actor || actor.role !== role) {
    throw new Error(MOCK_AUTHZ_DENIED);
  }
}

/**
 * shape خالی `DailyApprovalTrainee` برای mutationهای real که فقط پاسخ خالی
 * بک‌اند را دارند (score/conversations بدنهٔ مفید برنمی‌گردانند). فراخوان
 * (`useDailyApprovalsActions`) مقدار برگشتی را دور می‌ریزد و بعد از ثبت
 * `list.reload()` می‌زند — این فقط برای رعایت قرارداد تایپ متد سرویس است.
 */
function emptyDailyApprovalStub(
  traineeId: string,
  weekId: string
): DailyApprovalTrainee {
  return {
    id: traineeId,
    traineeName: '',
    identifier: '',
    major: '',
    schoolName: null,
    kind: 'internship',
    level: 1,
    courseKey: 'intern1',
    courseTitle: '',
    termId: '',
    termTitle: '',
    status: 'active',
    unreadCount: 0,
    hasSubmitted: true,
    progressiveGrade: { gradedCount: 0, final20: null, statusLabel: 'در جریان' },
    weeks: [
      {
        id: weekId,
        weekNumber: 0,
        status: 'graded',
        score: null,
        text: '',
        files: [],
        feedback: {},
        readBySupervisor: false,
      },
    ],
  };
}

/**
 * نمرهٔ گزارش هفتگی کارورز.
 * picker نیم‌سال/درس از `semesters_all`؛ هفته از `GET weeks/lesson`؛ بقیهٔ mutationها fail-closed.
 */
export const DailyApprovalsService = {
  /** کارورزی → `structure=semester`؛ کارآموزی → `podmani` — همان کلید ظرفیت. */
  async listTerms(
    kind: DailyApprovalCourseKind
  ): Promise<Array<{ id: string; title: string }>> {
    if (!isMockApiMode()) {
      return listRealCapacityTerms(kind);
    }
    requireDailyApprovalsReview();
    return listTermsForDailyApprovalKind(kind);
  },

  async listCourses(input: {
    kind: DailyApprovalCourseKind;
    termId: string;
  }): Promise<DailyApprovalCatalogCourse[]> {
    if (!isMockApiMode()) {
      return toDailyApprovalCatalogCourses(
        input.kind,
        await listRealCapacityCourses(input.kind, input.termId)
      );
    }
    requireDailyApprovalsReview();
    return listMockDailyApprovalCourses(input.kind);
  },

  async listWeeks(input: {
    kind: DailyApprovalCourseKind;
    termId: string;
    lessonId: string;
    courseFilter: Exclude<DailyApprovalCourseFilter, 'all'>;
  }): Promise<DailyApprovalWeekOption[]> {
    if (!isMockApiMode()) {
      const { weeks } = await getRealWeeksForLesson(input.termId, input.lessonId);
      return toDailyApprovalWeekOptions(
        weeks.filter((week) => week.status !== 'archived')
      );
    }
    requireDailyApprovalsReview();
    return listMockDailyApprovalWeeks(input.kind, input.courseFilter);
  },

  async getPassingScoreThreshold(): Promise<number> {
    if (!isMockApiMode()) {
      const settings = await getRealAcademicSettings();
      return settings.passingScoreThreshold;
    }
    requireDailyApprovalsReview();
    return readDailyApprovalPassingScoreThreshold();
  },

  async listPage(
    input: ListDailyApprovalsInput
  ): Promise<ListDailyApprovalsPage> {
    if (!isMockApiMode()) {
      return listRealDailyApprovals(input);
    }
    requireDailyApprovalsReview();
    await delayMockAdminListPage();
    return listMockDailyApprovals(input);
  },

  /** GET `/student-enrollments/mentor/capacity` — ظرفیت منتور در یک ترم. */
  async getMentorCapacity(semesterId: string): Promise<NestMentorCapacity> {
    return getRealDailyApprovalsMentorCapacity(semesterId);
  },

  /** باز کردن هفته را خوانده‌شده علامت می‌زند. */
  async openWeek(input: {
    traineeId: string;
    weekId: string;
  }): Promise<DailyApprovalTrainee> {
    if (isRealApiMode()) {
      await markRealDailyApprovalWeekOpened(input);
      return emptyDailyApprovalStub(input.traineeId, input.weekId);
    }
    requireDailyApprovalsReview();
    return markMockWeekRead(input);
  },

  /**
   * فقط real — گزارش دانشجو (متن/فایل) + بازخورد قبلی نقش جاری را برای همین
   * یک هفته می‌خواند؛ mock همیشه این داده را از قبل توی `trainee.weeks` دارد
   * پس اینجا چیزی نمی‌خواند (خالی برگرداندن در mock باعث پاک‌شدن داده‌ی
   * موجود نمی‌شود چون فراخوان فقط در real mode این متد را صدا می‌زند —
   * ببین `openWeekGrading` در `useDailyApprovalsActions`).
   */
  async loadWeekDetail(input: {
    traineeId: string;
    weekId: string;
    role: UserRole | null | undefined;
    teacherId?: string | null;
  }): Promise<DailyApprovalWeekDetail> {
    return loadRealDailyApprovalWeekDetail({
      enrollmentId: input.traineeId,
      weekId: input.weekId,
      role: input.role,
      teacherId: input.teacherId,
    });
  },

  /**
   * real: `PATCH student-weeks/{id}/score` — فقط نمرهٔ عددی، بدون متن بازخورد
   * (هنوز جای واقعی ندارد). شیءِ برگشتی فقط برای رعایت قرارداد تایپه — تنها
   * فراخوان این متد (`useDailyApprovalsActions`) مقدارش را دور می‌ریزد و برای
   * تصویر واقعی بعد از ثبت `list.reload()` می‌زند.
   */
  async updateWeekEvaluation(
    input: UpdateDailyApprovalWeekInput
  ): Promise<DailyApprovalTrainee> {
    if (isRealApiMode()) {
      await scoreRealDailyApprovalWeek(input);
      return emptyDailyApprovalStub(input.traineeId, input.weekId);
    }
    requireReviewRole('supervisor_professor');
    await new Promise((resolve) => setTimeout(resolve, 250));
    return updateMockDailyApprovalWeek({
      ...input,
      advisorFeedback: input.advisorFeedback.trim(),
    });
  },

  /**
   * real: امتیاز شایستگی (الزامی) + بازخورد متنی (اختیاری) معلم راهنما را
   * به‌عنوان یک پیام در گفتگوی هفته (`conversations`) می‌فرستد — ببین
   * `submitMentorFeedbackReal`. شیءِ برگشتی فقط برای رعایت قرارداد تایپه؛
   * فراخوان بعد از ثبت `list.reload()` می‌زند.
   */
  async updateMentorWeekEvaluation(
    input: UpdateMentorDailyApprovalWeekInput
  ): Promise<DailyApprovalTrainee> {
    if (isRealApiMode()) {
      await submitMentorFeedbackReal(input);
      return emptyDailyApprovalStub(input.traineeId, input.weekId);
    }
    requireReviewRole('mentor_teacher');
    await new Promise((resolve) => setTimeout(resolve, 250));
    return updateMockMentorDailyApprovalWeek({
      ...input,
      mentorFeedback: input.mentorFeedback.trim(),
    });
  },

  /**
   * real: بازخورد توصیفی و/یا امتیاز شایستگی مدیر مدرسه (هر دو اختیاری، ولی
   * حداقل یکی الزامی) را به‌عنوان پیام در گفتگوی هفته می‌فرستد — ببین
   * `submitPrincipalFeedbackReal`.
   */
  async updatePrincipalWeekEvaluation(
    input: UpdatePrincipalDailyApprovalWeekInput
  ): Promise<DailyApprovalTrainee> {
    if (isRealApiMode()) {
      await submitPrincipalFeedbackReal(input);
      return emptyDailyApprovalStub(input.traineeId, input.weekId);
    }
    requireReviewRole('school_principal');
    await new Promise((resolve) => setTimeout(resolve, 250));
    return updateMockPrincipalDailyApprovalWeek({
      ...input,
      principalFeedback: input.principalFeedback.trim(),
    });
  },

  async extendWeek(
    input: ExtendDailyApprovalWeekInput
  ): Promise<DailyApprovalTrainee> {
    if (isRealApiMode()) {
      assertDailyApprovalsMutationReady('DailyApprovalsService.extendWeek');
    }
    requireReviewRole('supervisor_professor');
    await new Promise((resolve) => setTimeout(resolve, 200));
    return extendMockDailyApprovalWeek(input);
  },

  async bulkExtendWeeks(
    input: BulkExtendDailyApprovalWeeksInput
  ): Promise<BulkExtendDailyApprovalWeeksResult> {
    if (isRealApiMode()) {
      assertDailyApprovalsMutationReady('DailyApprovalsService.bulkExtendWeeks');
    }
    requireReviewRole('supervisor_professor');
    await new Promise((resolve) => setTimeout(resolve, 250));
    return bulkExtendMockDailyApprovalWeeks({
      ...input,
      weekNumbers: input.weekNumbers.map((weekNumber) =>
        Number(String(weekNumber))
      ),
      revokeWeekNumbers: (input.revokeWeekNumbers ?? []).map((weekNumber) =>
        Number(String(weekNumber))
      ),
    });
  },

  /** real: `PATCH student-enrollments/{id}/cancel` — حذف کارورز از کلاس. */
  async dropTrainee(
    input: DropDailyApprovalTraineeInput
  ): Promise<DailyApprovalTrainee> {
    if (isRealApiMode()) {
      await dropRealDailyApprovalTrainee(input.traineeId);
      return emptyDailyApprovalStub(input.traineeId, '');
    }
    requireReviewRole('supervisor_professor');
    await new Promise((resolve) => setTimeout(resolve, 200));
    return dropMockDailyApprovalTrainee(input.traineeId);
  },

  /** برگرداندن snapshot قبل از حذف (فقط mock). */
  async restoreTrainee(
    trainee: DailyApprovalTrainee
  ): Promise<DailyApprovalTrainee> {
    if (isRealApiMode()) {
      assertDailyApprovalsMutationReady('DailyApprovalsService.restoreTrainee');
    }
    requireReviewRole('supervisor_professor');
    await new Promise((resolve) => setTimeout(resolve, 150));
    return restoreMockDailyApprovalTrainee(trainee);
  },
};
