'use client';

import { notFound, useParams } from 'next/navigation';

import { ProfileModule } from '@/features/shared/profile/components/ProfileModule';
import { parseUserRole } from '@/utils/userRole';

export function ProfileClientPage() {
  const params = useParams();
  const raw = typeof params.role === 'string' ? params.role : '';
  const role = parseUserRole(raw);
  if (!role) notFound();

  return <ProfileModule role={role} />;
}
