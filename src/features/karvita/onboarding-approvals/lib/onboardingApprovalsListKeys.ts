import type { ApprovalFilterTab } from '@/types/onboarding-approvals';

export const ONBOARDING_APPROVALS_CACHE_NAMESPACE = 'onboarding-approvals';
export const ONBOARDING_APPROVALS_CHROME_ID = 'onboarding-approvals';

/** `resetKey` لیست بی‌نهایت تأییدها: تب + جستجو + فیلتر استان. */
export function onboardingApprovalsListResetKey(
  tab: ApprovalFilterTab,
  listQuery: string,
  province: string
): string {
  return `${tab}::${listQuery}::${province}`;
}
