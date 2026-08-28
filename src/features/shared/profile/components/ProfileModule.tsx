'use client';

import { ProfileContainer } from '@/features/shared/profile/components/ProfileContainer';
import type { UserRole } from '@/types/auth';

export function ProfileModule({ role }: { role: UserRole }) {
  return <ProfileContainer role={role} />;
}
