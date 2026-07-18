import { redirect } from 'next/navigation';

import { RouteService } from '@/services/route.service';

/**
 * Legacy bookmark `/karvita/onboarding-approvals` → admin control-plane path.
 */
export default function LegacyOnboardingApprovalsRedirect() {
  redirect(RouteService.karvita.onboardingApprovals());
}
