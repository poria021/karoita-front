/**
 * Public barrel for mock daily-approvals store.
 * Implementation is split across persistence / query / mutations + pure derived helpers.
 */

export {
  TRAINEE_SEEDS,
  WEEK_STATE_CYCLE,
} from '@/services/daily-approvals/mock-daily-approvals-seeds';
export { resetMockDailyApprovalsForTests } from '@/services/daily-approvals/mock-daily-approvals-persistence';
export {
  listMockDailyApprovals,
  listTermsForDailyApprovalKind,
} from '@/services/daily-approvals/mock-daily-approvals-query';
export {
  bulkExtendMockDailyApprovalWeeks,
  dropMockDailyApprovalTrainee,
  extendMockDailyApprovalWeek,
  markMockWeekRead,
  updateMockDailyApprovalWeek,
  updateMockMentorDailyApprovalWeek,
  updateMockPrincipalDailyApprovalWeek,
} from '@/services/daily-approvals/mock-daily-approvals-mutations';
