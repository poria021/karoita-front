import type { Metadata } from 'next';

import { ProfileClientPage } from '@/features/shared/profile/components/ProfileClientPage';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';
import { parseUserRole } from '@/utils/userRole';

interface ProfileRoutePageProps {
  params: Promise<{ role: string }>;
}

export async function generateProfileRouteMetadata({
  params,
}: ProfileRoutePageProps): Promise<Metadata> {
  const { role } = await params;
  const parsedRole = parseUserRole(role);
  if (!parsedRole) {
    return dashboardModuleMetadata('profile');
  }
  return dashboardModuleMetadata('profile', parsedRole);
}

export default function ProfileRoutePage() {
  return <ProfileClientPage />;
}
