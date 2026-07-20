import type { DocStatus, User } from '@/types/auth';
import type { OffsetLimitPage } from '@/utils/offset-limit-page';

export type ApprovalFilterTab = Extract<
  DocStatus,
  'pending_admin' | 'approved' | 'rejected'
>;

export type OnboardingApprovalUser = User & {
  fullName: string;
};

export type ListOnboardingApprovalsFilters = {
  status: ApprovalFilterTab;
  query?: string;
  province?: string;
  offset?: number;
  limit?: number;
};

export type ListOnboardingApprovalsPage =
  OffsetLimitPage<OnboardingApprovalUser> & {
    provinces: string[];
  };
