'use client';

import { loadDashboardClient } from '@/components/shared/shell/loadDashboardClient';

export const OnboardingApprovalsModule = loadDashboardClient(() =>
  import('@/features/karvita/onboarding-approvals/components/OnboardingApprovalsPageClient').then(
    (mod) => ({ default: mod.OnboardingApprovalsPageClient })
  )
);
