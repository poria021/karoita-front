import { redirect } from 'next/navigation';

import { RouteService } from '@/services/route.service';

export default function LegacyOnboardingApprovalsRedirect() {
  redirect(RouteService.karvita.onboardingApprovals());
}
