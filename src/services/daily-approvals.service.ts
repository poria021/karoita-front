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
} from '@/services/daily-approvals/mock-daily-approvals-store';
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
 * Trainee weekly-report grading facade (trainee_reports_grading).
 * Real mode fail-closed until Nest routes below land.
 *
 * Nest map:
 * - GET   /daily-approvals/terms?kind=
 * - GET   /syllabus/passing-threshold
 * - GET   /daily-approvals?kind&query&readFilter&course&termId&offset&limit
 * - POST  /daily-approvals/:traineeId/weeks/:weekId/open
 * - PATCH /daily-approvals/:traineeId/weeks/:weekId
 * - PATCH /daily-approvals/:traineeId/weeks/:weekId/mentor
 * - PATCH /daily-approvals/:traineeId/weeks/:weekId/principal
 * - POST  /daily-approvals/:traineeId/weeks/:weekId/extend
 * - POST  /daily-approvals/weeks/bulk-extend
 * - POST  /daily-approvals/:traineeId/drop
 */
export const DailyApprovalsService = {
  /** GET /daily-approvals/terms?kind= — internship→semester, apprenticeship→modular */
  async listTerms(
    kind: DailyApprovalCourseKind
  ): Promise<Array<{ id: string; title: string }>> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('DailyApprovalsService.listTerms');
    }
    requireDailyApprovalsReview();
    return listTermsForDailyApprovalKind(kind);
  },

  /** GET /syllabus/passing-threshold — 0–100 */
  async getPassingScoreThreshold(): Promise<number> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented(
        'DailyApprovalsService.getPassingScoreThreshold'
      );
    }
    requireDailyApprovalsReview();
    return readDailyApprovalPassingScoreThreshold();
  },

  /** GET /daily-approvals — offset/limit page */
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

  /** POST /daily-approvals/:traineeId/weeks/:weekId/open — marks week read */
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

  /** PATCH /daily-approvals/:traineeId/weeks/:weekId — supervisor */
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

  /** PATCH /daily-approvals/:traineeId/weeks/:weekId/mentor */
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

  /** PATCH /daily-approvals/:traineeId/weeks/:weekId/principal */
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

  /** POST /daily-approvals/:traineeId/weeks/:weekId/extend */
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

  /** POST /daily-approvals/weeks/bulk-extend */
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

  /** POST /daily-approvals/:traineeId/drop */
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

  /** Undo drop — restore prior trainee snapshot (mock). */
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
