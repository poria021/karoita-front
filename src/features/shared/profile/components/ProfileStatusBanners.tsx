'use client';

import type { DocStatus } from '@/types/auth';

import { ProfileStatusAlert } from './alerts/ProfileStatusAlert';

interface ProfileStatusBannersProps {
  isApproved: boolean;
  docStatus: DocStatus;
  adminRequestMessage?: string;
}

/**
 * @deprecated Use `ProfileStatusAlert` directly.
 * Thin compatibility wrapper for legacy `ProfileForm`.
 */
export function ProfileStatusBanners({
  isApproved,
  docStatus,
  adminRequestMessage,
}: ProfileStatusBannersProps) {
  return (
    <ProfileStatusAlert
      approved={isApproved}
      docStatus={docStatus}
      adminRequestMessage={adminRequestMessage}
    />
  );
}
