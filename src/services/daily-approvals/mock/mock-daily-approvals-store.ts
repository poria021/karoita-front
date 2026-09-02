/**
 * بشکهٔ عمومی store mock تأیید روزانه.
 * پیاده‌سازی در persistence / query / mutations و هلپرهای derived است.
 */

export {
  TRAINEE_SEEDS,
  WEEK_STATE_CYCLE,
} from '@/services/daily-approvals/mock/mock-daily-approvals-seeds';
export { resetMockDailyApprovalsForTests } from '@/services/daily-approvals/mock/mock-daily-approvals-persistence';
export {
  listMockDailyApprovals,
  listMockDailyApprovalCourses,
  listMockDailyApprovalWeeks,
  listTermsForDailyApprovalKind,
} from '@/services/daily-approvals/mock/mock-daily-approvals-query';
export {
  bulkExtendMockDailyApprovalWeeks,
  dropMockDailyApprovalTrainee,
  extendMockDailyApprovalWeek,
  markMockWeekRead,
  restoreMockDailyApprovalTrainee,
  updateMockDailyApprovalWeek,
  updateMockMentorDailyApprovalWeek,
  updateMockPrincipalDailyApprovalWeek,
} from '@/services/daily-approvals/mock/mock-daily-approvals-mutations';
