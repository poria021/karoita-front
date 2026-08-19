'use client';

import { loadDashboardClient } from '@/components/shared/shell/loadDashboardClient';

export const AdminUserCreationModule = loadDashboardClient(() =>
  import('@/features/karvita/user-creation/components/AdminUserCreationPageClient').then(
    (mod) => ({ default: mod.AdminUserCreationPageClient })
  )
);
