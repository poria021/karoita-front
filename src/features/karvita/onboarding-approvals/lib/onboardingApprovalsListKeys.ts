import type { ApprovalFilterTab } from '@/types/onboarding-approvals';

export const ONBOARDING_APPROVALS_CACHE_NAMESPACE = 'onboarding-approvals';
export const ONBOARDING_APPROVALS_CHROME_ID = 'onboarding-approvals';

/** resetKey for approvals infinite list: tab + search + province filter. */
export function onboardingApprovalsListResetKey(
  tab: ApprovalFilterTab,
  listQuery: string,
  province: string
): string {
  return `${tab}::${listQuery}::${province}`;
}
