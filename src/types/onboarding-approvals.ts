import type { DocStatus, User, UserRole } from '@/types/auth';
import type { OffsetLimitPage } from '@/utils/offset-limit-page';

/** Status tabs on the onboarding approvals workspace (excludes `not_submitted`). */
export type ApprovalFilterTab = Extract<
  DocStatus,
  'pending_admin' | 'approved' | 'rejected'
>;

/** Roles shown in the approvals role filter (parity with original HTML). */
export type ApprovalRoleFilter =
  | 'all'
  | Extract<
      UserRole,
      | 'student'
      | 'skill_learner'
      | 'supervisor_professor'
      | 'mentor_teacher'
      | 'school_principal'
    >;

/** List/detail DTO for identity-doc review — flat User + review metadata. */
export type OnboardingApprovalUser = User & {
  /** Display name helper for tables (first + last). */
  fullName: string;
};

export type ListOnboardingApprovalsFilters = {
  status: ApprovalFilterTab;
  query?: string;
  province?: string;
  role?: ApprovalRoleFilter;
  offset?: number;
  limit?: number;
};

/** Nest-aligned page + province filter options for the toolbar. */
export type ListOnboardingApprovalsPage =
  OffsetLimitPage<OnboardingApprovalUser> & {
    provinces: string[];
  };
