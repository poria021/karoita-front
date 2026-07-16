import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import {
  ProfileContainer,
  ProfileContainerSkeleton,
} from '@/features/shared/profile/components/ProfileContainer';
import type { UserRole } from '@/types/auth';

export const dynamic = 'force-dynamic';

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

/**
 * Karvita profile route — RSC entry that awaits Next.js 15 async `params`
 * and streams the client ProfileContainer behind a skeleton Suspense boundary.
 */
export default async function ProfilePage({ params }: ProfilePageProps) {
  const { role } = await params;

  if (!isUserRole(role)) {
    notFound();
  }

  return (
    <Suspense fallback={<ProfileContainerSkeleton />}>
      <ProfileContainer role={role} />
    </Suspense>
  );
}
