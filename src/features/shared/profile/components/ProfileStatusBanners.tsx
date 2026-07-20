'use client';

import type { DocStatus } from '@/types/auth';

import { ProfileStatusAlert } from './alerts/ProfileStatusAlert';

interface ProfileStatusBannersProps {
  isApproved: boolean;
  docStatus: DocStatus;
  adminRequestMessage?: string;
}

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
