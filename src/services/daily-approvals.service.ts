import { isMockApiMode, isRealApiMode, throwRealModeNotImplemented } from '@/lib/api-mode';
import { listRealCapacityCourses, listRealCapacityTerms } from '@/services/organizational-capacities/real/real-organizational-capacities';
import {
  toDailyApprovalCatalogCourses,
  toDailyApprovalWeekOptions,
} from '@/services/daily-approvals/daily-approval-catalog-mappers';
import {
  MOCK_BULK_EXTEND_RESULT,
  mockDailyApprovalCourses,
  mockDailyApprovalPassingScore,
  mockDailyApprovalsPage,
  mockDailyApprovalTerms,
  mockDailyApprovalTrainee,
  mockDailyApprovalWeeks,
} from '@/services/daily-approvals/mock/daily-approvals.fixtures';
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
  refreshRealDailyApprovalTraineeDerived,
  type DailyApprovalTraineeDerived,
} from '@/services/daily-approvals/real/real-daily-approvals-reads';
import {
  getRealAcademicSettings,
  getRealWeeksForLesson,
} from '@/services/syllabus-config/real/real-syllabus-reads';
import type { UserRole } from '@/types/auth';
import type { NestMentorCapacity } from '@/types/nest-student-enrollments';
import type {
  BulkExtendDailyApprovalWeeksInput,
  BulkExtendDailyApprovalWeeksResult,
  DailyApprovalCatalogCourse,
  DailyApprovalCourseFilter,
  DailyApprovalCourseKind,
  DailyApprovalTrainee,
  DailyApprovalTraineeStatus,
  DailyApprovalWeekDetail,
  DailyApprovalWeekOption,
  DropDailyApprovalTraineeInput,
  ExtendDailyApprovalWeekInput,
  ForwardDailyApprovalWeekInput,
  ListDailyApprovalsInput,
  ListDailyApprovalsPage,
  UpdateDailyApprovalWeekInput,
  UpdateMentorDailyApprovalWeekInput,
  UpdatePrincipalDailyApprovalWeekInput,
} from '@/types/daily-approvals';
import { DEFAULT_PAGE_LIMIT } from '@/utils/offset-limit-page';

export const DAILY_APPROVALS_PAGE_SIZE = DEFAULT_PAGE_LIMIT;

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
    return mockDailyApprovalTerms(kind);
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
    return mockDailyApprovalCourses(input.kind);
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
    return mockDailyApprovalWeeks(input.kind);
  },

  async getPassingScoreThreshold(): Promise<number> {
    if (!isMockApiMode()) {
      const settings = await getRealAcademicSettings();
      return settings.passingScoreThreshold;
    }
    return mockDailyApprovalPassingScore();
  },

  async listPage(
    input: ListDailyApprovalsInput
  ): Promise<ListDailyApprovalsPage> {
    if (!isMockApiMode()) {
      return listRealDailyApprovals(input);
    }
    return mockDailyApprovalsPage(input);
  },

  /**
   * استاد راهنما گزارش یک هفته را برای معلم یا مدیر مدرسه ارجاع می‌دهد.
   * فقط mock؛ real تا آمدن endpoint در Nest fail-closed است.
   */
  async forwardWeek(
    input: ForwardDailyApprovalWeekInput
  ): Promise<DailyApprovalTrainee> {
    if (isRealApiMode()) {
      throwRealModeNotImplemented('DailyApprovalsService.forwardWeek');
    }
    return mockDailyApprovalTrainee(input.traineeId);
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
    return mockDailyApprovalTrainee(input.traineeId);
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
   * فقط real — هفته‌ها/unreadCount/نمرهٔ پیش‌رونده *فقط یک* فراگیر را دوباره
   * می‌خواند (۳ درخواست) تا فراخوان بتواند بعد از یک mutation فقط همان یک
   * ردیف را در کشِ لیست پچ کند، به‌جای `listPage` کامل برای کل صفحه — ببین
   * `refreshTraineeDerived` در `useDailyApprovalsActions`.
   */
  async refreshTraineeDerived(input: {
    traineeId: string;
    status: DailyApprovalTraineeStatus;
  }): Promise<DailyApprovalTraineeDerived> {
    return refreshRealDailyApprovalTraineeDerived(input.traineeId, input.status);
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
    return mockDailyApprovalTrainee(input.traineeId);
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
    return mockDailyApprovalTrainee(input.traineeId);
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
    return mockDailyApprovalTrainee(input.traineeId);
  },

  async extendWeek(
    input: ExtendDailyApprovalWeekInput
  ): Promise<DailyApprovalTrainee> {
    if (isRealApiMode()) {
      assertDailyApprovalsMutationReady('DailyApprovalsService.extendWeek');
    }
    return mockDailyApprovalTrainee(input.traineeId);
  },

  async bulkExtendWeeks(
    _input: BulkExtendDailyApprovalWeeksInput
  ): Promise<BulkExtendDailyApprovalWeeksResult> {
    if (isRealApiMode()) {
      assertDailyApprovalsMutationReady('DailyApprovalsService.bulkExtendWeeks');
    }
    return MOCK_BULK_EXTEND_RESULT;
  },

  /** real: `PATCH student-enrollments/{id}/cancel` — حذف کارورز از کلاس. */
  async dropTrainee(
    input: DropDailyApprovalTraineeInput
  ): Promise<DailyApprovalTrainee> {
    if (isRealApiMode()) {
      await dropRealDailyApprovalTrainee(input.traineeId);
      return emptyDailyApprovalStub(input.traineeId, '');
    }
    return mockDailyApprovalTrainee(input.traineeId);
  },

  /** برگرداندن snapshot قبل از حذف (فقط mock). */
  async restoreTrainee(
    trainee: DailyApprovalTrainee
  ): Promise<DailyApprovalTrainee> {
    if (isRealApiMode()) {
      assertDailyApprovalsMutationReady('DailyApprovalsService.restoreTrainee');
    }
    return trainee;
  },
};
