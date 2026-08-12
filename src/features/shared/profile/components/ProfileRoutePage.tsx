import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import {
  ProfileContainer,
  ProfileRoutePlaceholder,
} from '@/features/shared/profile/components/ProfileContainer';
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

export default async function ProfileRoutePage({
  params,
}: ProfileRoutePageProps) {
  const { role } = await params;
  const parsedRole = parseUserRole(role);

  if (!parsedRole) {
    notFound();
  }

  return (
    <Suspense fallback={<ProfileRoutePlaceholder />}>
      <ProfileContainer role={parsedRole} />
    </Suspense>
  );
}
