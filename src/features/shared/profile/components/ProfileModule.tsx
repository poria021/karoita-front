'use client';

import { loadDashboardClient } from '@/components/shared/shell/loadDashboardClient';
import type { UserRole } from '@/types/auth';

const ProfileContainer = loadDashboardClient<{ role: UserRole }>(() =>
  import('@/features/shared/profile/components/ProfileContainer').then(
    (mod) => ({ default: mod.ProfileContainer })
  )
);

export function ProfileModule({ role }: { role: UserRole }) {
  return <ProfileContainer role={role} />;
}
