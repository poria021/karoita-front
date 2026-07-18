import type { DocStatus, User, UserRole } from '@/types/auth';

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
};

export type ListOnboardingApprovalsResult = {
  users: OnboardingApprovalUser[];
  provinces: string[];
  total: number;
};
