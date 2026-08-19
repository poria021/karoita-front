'use client';

import { loadDashboardClient } from '@/components/shared/shell/loadDashboardClient';

export const DailyApprovalsModule = loadDashboardClient(() =>
  import('@/features/karvita/daily-approvals/components/DailyApprovalsPageClient').then(
    (mod) => ({ default: mod.DailyApprovalsPageClient })
  )
);
