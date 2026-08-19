'use client';

import { loadDashboardClient } from '@/components/shared/shell/loadDashboardClient';

export const OrgStructureModule = loadDashboardClient(() =>
  import('@/features/karvita/organizational-structure/components/OrgStructurePageClient').then(
    (mod) => ({ default: mod.OrgStructurePageClient })
  )
);
