import { isMockApiMode, throwRealModeNotImplemented } from '@/lib/api-mode';
import { delayMockAdminListPage } from '@/lib/mock-admin-list-delay';
import {
  dropMockDailyApprovalTrainee,
  extendMockDailyApprovalWeek,
  listMockDailyApprovals,
  markMockWeekRead,
  updateMockDailyApprovalWeek,
} from '@/services/daily-approvals/mock-daily-approvals-store';
import {
  assertMockClientHasPermission,
  MOCK_AUTHZ_DENIED,
} from '@/services/mock/mock-authz';
import { useUserStore } from '@/store/useUserStore';
import type {
  DailyApprovalTrainee,
  DropDailyApprovalTraineeInput,
  ExtendDailyApprovalWeekInput,
  ListDailyApprovalsInput,
  ListDailyApprovalsPage,
  UpdateDailyApprovalWeekInput,
} from '@/types/daily-approvals';
import { DEFAULT_PAGE_LIMIT } from '@/utils/offset-limit-page';

export const DAILY_APPROVALS_PAGE_SIZE = DEFAULT_PAGE_LIMIT;

function requireSupervisorReview(): void {
  if (!isMockApiMode()) {
    throwRealModeNotImplemented('DailyApprovalsService');
  }
  assertMockClientHasPermission('daily-approval.review');
  const actor = useUserStore.getState().activeUser;
  if (!actor || actor.role !== 'supervisor_professor') {
    throw new Error(MOCK_AUTHZ_DENIED);
  }
}

/**
 * Facade ارزیابی گزارش‌های فراگیران (مرجع: trainee_reports_grading).
 *
 * Nest-blocked:
 * - GET /daily-approvals?kind&query&readFilter&course&termId&offset&limit
 * - PATCH /daily-approvals/:traineeId/weeks/:weekId
 * - POST  /daily-approvals/:traineeId/weeks/:weekId/extend
 * - POST  /daily-approvals/:traineeId/drop
 */
export const DailyApprovalsService = {
  async listPage(
    input: ListDailyApprovalsInput
  ): Promise<ListDailyApprovalsPage> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('DailyApprovalsService.listPage');
    }
    requireSupervisorReview();
    await delayMockAdminListPage();
    return listMockDailyApprovals(input);
  },

  async openWeek(input: {
    traineeId: string;
    weekId: string;
  }): Promise<DailyApprovalTrainee> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('DailyApprovalsService.openWeek');
    }
    requireSupervisorReview();
    return markMockWeekRead(input);
  },

  async updateWeekEvaluation(
    input: UpdateDailyApprovalWeekInput
  ): Promise<DailyApprovalTrainee> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('DailyApprovalsService.updateWeekEvaluation');
    }
    requireSupervisorReview();
    await new Promise((resolve) => setTimeout(resolve, 250));
    return updateMockDailyApprovalWeek({
      ...input,
      advisorFeedback: input.advisorFeedback.trim(),
    });
  },

  async extendWeek(
    input: ExtendDailyApprovalWeekInput
  ): Promise<DailyApprovalTrainee> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('DailyApprovalsService.extendWeek');
    }
    requireSupervisorReview();
    await new Promise((resolve) => setTimeout(resolve, 200));
    return extendMockDailyApprovalWeek(input);
  },

  async dropTrainee(
    input: DropDailyApprovalTraineeInput
  ): Promise<DailyApprovalTrainee> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('DailyApprovalsService.dropTrainee');
    }
    requireSupervisorReview();
    await new Promise((resolve) => setTimeout(resolve, 200));
    return dropMockDailyApprovalTrainee(input.traineeId);
  },
};
