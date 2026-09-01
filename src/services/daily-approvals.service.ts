import { isMockApiMode, throwRealModeNotImplemented } from '@/lib/api-mode';
import { delayMockAdminListPage } from '@/lib/mock-admin-list-delay';
import {
  bulkExtendMockDailyApprovalWeeks,
  dropMockDailyApprovalTrainee,
  extendMockDailyApprovalWeek,
  listMockDailyApprovals,
  listTermsForDailyApprovalKind,
  markMockWeekRead,
  restoreMockDailyApprovalTrainee,
  updateMockDailyApprovalWeek,
  updateMockMentorDailyApprovalWeek,
  updateMockPrincipalDailyApprovalWeek,
} from '@/services/daily-approvals/mock/mock-daily-approvals-store';
import { readDailyApprovalPassingScoreThreshold } from '@/services/syllabus-config/syllabus-daily-approvals-reads';
import {
  assertMockClientHasPermission,
  MOCK_AUTHZ_DENIED,
} from '@/services/mock/mock-authz';
import { useUserStore } from '@/store/useUserStore';
import type { UserRole } from '@/types/auth';
import type {
  BulkExtendDailyApprovalWeeksInput,
  BulkExtendDailyApprovalWeeksResult,
  DailyApprovalCourseKind,
  DailyApprovalTrainee,
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
  if (!isMockApiMode()) {
    throwRealModeNotImplemented('DailyApprovalsService');
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
 * نمرهٔ گزارش هفتگی کارورز. تا آمدن routeهای Nest در real fail-closed است.
 */
export const DailyApprovalsService = {
  /** کارورزی → ترم نیم‌سال؛ مهارت‌آموزی → پودمانی. */
  async listTerms(
    kind: DailyApprovalCourseKind
  ): Promise<Array<{ id: string; title: string }>> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('DailyApprovalsService.listTerms');
    }
    requireDailyApprovalsReview();
    return listTermsForDailyApprovalKind(kind);
  },

  async getPassingScoreThreshold(): Promise<number> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented(
        'DailyApprovalsService.getPassingScoreThreshold'
      );
    }
    requireDailyApprovalsReview();
    return readDailyApprovalPassingScoreThreshold();
  },

  async listPage(
    input: ListDailyApprovalsInput
  ): Promise<ListDailyApprovalsPage> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('DailyApprovalsService.listPage');
    }
    requireDailyApprovalsReview();
    await delayMockAdminListPage();
    return listMockDailyApprovals(input);
  },

  /** باز کردن هفته را خوانده‌شده علامت می‌زند. */
  async openWeek(input: {
    traineeId: string;
    weekId: string;
  }): Promise<DailyApprovalTrainee> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('DailyApprovalsService.openWeek');
    }
    requireDailyApprovalsReview();
    return markMockWeekRead(input);
  },

  async updateWeekEvaluation(
    input: UpdateDailyApprovalWeekInput
  ): Promise<DailyApprovalTrainee> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('DailyApprovalsService.updateWeekEvaluation');
    }
    requireReviewRole('supervisor_professor');
    await new Promise((resolve) => setTimeout(resolve, 250));
    return updateMockDailyApprovalWeek({
      ...input,
      advisorFeedback: input.advisorFeedback.trim(),
    });
  },

  async updateMentorWeekEvaluation(
    input: UpdateMentorDailyApprovalWeekInput
  ): Promise<DailyApprovalTrainee> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented(
        'DailyApprovalsService.updateMentorWeekEvaluation'
      );
    }
    requireReviewRole('mentor_teacher');
    await new Promise((resolve) => setTimeout(resolve, 250));
    return updateMockMentorDailyApprovalWeek({
      ...input,
      mentorFeedback: input.mentorFeedback.trim(),
    });
  },

  async updatePrincipalWeekEvaluation(
    input: UpdatePrincipalDailyApprovalWeekInput
  ): Promise<DailyApprovalTrainee> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented(
        'DailyApprovalsService.updatePrincipalWeekEvaluation'
      );
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
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('DailyApprovalsService.extendWeek');
    }
    requireReviewRole('supervisor_professor');
    await new Promise((resolve) => setTimeout(resolve, 200));
    return extendMockDailyApprovalWeek(input);
  },

  async bulkExtendWeeks(
    input: BulkExtendDailyApprovalWeeksInput
  ): Promise<BulkExtendDailyApprovalWeeksResult> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('DailyApprovalsService.bulkExtendWeeks');
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

  async dropTrainee(
    input: DropDailyApprovalTraineeInput
  ): Promise<DailyApprovalTrainee> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('DailyApprovalsService.dropTrainee');
    }
    requireReviewRole('supervisor_professor');
    await new Promise((resolve) => setTimeout(resolve, 200));
    return dropMockDailyApprovalTrainee(input.traineeId);
  },

  /** برگرداندن snapshot قبل از حذف (فقط mock). */
  async restoreTrainee(
    trainee: DailyApprovalTrainee
  ): Promise<DailyApprovalTrainee> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('DailyApprovalsService.restoreTrainee');
    }
    requireReviewRole('supervisor_professor');
    await new Promise((resolve) => setTimeout(resolve, 150));
    return restoreMockDailyApprovalTrainee(trainee);
  },
};
