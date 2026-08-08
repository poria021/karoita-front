import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import {
  ProfileContainer,
  ProfileRoutePlaceholder,
} from '@/features/shared/profile/components/ProfileContainer';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';
import type { UserRole } from '@/types/auth';

const VALID_ROLES: readonly UserRole[] = [
  'student',
  'skill_learner',
  'supervisor_professor',
  'mentor_teacher',
  'school_principal',
  'regional_edu_admin',
  'faculty_role',
  'provincial_university',
  'assistant_admin',
  'central_organization',
  'super_admin',
] as const;

function isUserRole(value: string): value is UserRole {
  return (VALID_ROLES as readonly string[]).includes(value);
}

interface ProfilePageProps {
  params: Promise<{ role: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { role } = await params;
  if (!isUserRole(role)) {
    return dashboardModuleMetadata('profile');
  }
  return dashboardModuleMetadata('profile', role);
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { role } = await params;

  if (!isUserRole(role)) {
    notFound();
  }

  return (
    <Suspense fallback={<ProfileRoutePlaceholder />}>
      <ProfileContainer role={role} />
    </Suspense>
  );
}
