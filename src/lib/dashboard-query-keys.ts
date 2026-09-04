import type { QueryClient } from '@tanstack/react-query';

/**
 * Query key prefixes for dashboard server-state.
 * After a mutation, invalidate every consumer of that catalog — do not
 * keep a second copy of the list in `useDashboardModuleCache.setData`.
 */
export const DASHBOARD_QUERY = {
  syllabusSnapshot: ['syllabus-config', 'snapshot'] as const,
  passingScoreThreshold: ['syllabus-config', 'passing-threshold'] as const,
  orgCapacities: ['org-capacities'] as const,
  orgCapacitiesTerms: (kind: string) =>
    ['org-capacities', 'terms', kind] as const,
  orgCapacitiesSnapshot: (kind: string, termId: string) =>
    ['org-capacities', 'snapshot', kind, termId] as const,
  dailyApprovalsTerms: (kind: string) =>
    ['daily-approvals', 'terms', kind] as const,
  dailyApprovalsCourses: (kind: string, termId: string) =>
    ['daily-approvals', 'courses', kind, termId] as const,
  internshipEnrollment: ['internship-enrollment'] as const,
  orgOptions: ['org-options'] as const,
  onboardingApprovalsProvinces: ['onboarding-approvals', 'provinces'] as const,
} as const;

/** Capacity, daily-approvals, and enrollment all read Nest semesters. */
export function invalidateAcademicTermConsumers(
  queryClient: QueryClient
): Promise<void> {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: DASHBOARD_QUERY.orgCapacities,
    }),
    queryClient.invalidateQueries({ queryKey: ['daily-approvals'] }),
    queryClient.invalidateQueries({
      queryKey: DASHBOARD_QUERY.internshipEnrollment,
    }),
    queryClient.invalidateQueries({
      queryKey: DASHBOARD_QUERY.passingScoreThreshold,
    }),
  ]).then(() => undefined);
}

/** Typeahead and onboarding filters read the same org directory. */
export function invalidateOrganizationDirectoryConsumers(
  queryClient: QueryClient
): Promise<void> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY.orgOptions }),
    queryClient.invalidateQueries({
      queryKey: DASHBOARD_QUERY.onboardingApprovalsProvinces,
    }),
  ]).then(() => undefined);
}
