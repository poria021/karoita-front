'use client';

import { loadDashboardClient } from '@/components/shared/shell/loadDashboardClient';

export const OrganizationalCapacitiesModule = loadDashboardClient(() =>
  import('@/features/karvita/organizational-capacities/components/OrganizationalCapacitiesPageClient').then(
    (mod) => ({ default: mod.OrganizationalCapacitiesPageClient })
  )
);
