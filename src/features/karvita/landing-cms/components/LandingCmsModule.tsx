'use client';

import { loadDashboardClient } from '@/components/shared/shell/loadDashboardClient';

export const LandingCmsModule = loadDashboardClient(() =>
  import('@/features/karvita/landing-cms/components/LandingCmsPageClient').then(
    (mod) => ({ default: mod.LandingCmsPageClient })
  )
);
