import type { ProfileDto } from '@/types/profile';
import type { MockAuthUserRecord } from '@/services/auth/mock/auth-mock-users';
import {
  findMockUserById,
  findMockUserByMobile,
  patchMockAuthUser,
  toPublicUser,
} from '@/services/auth/mock/mock-auth.store';
import { useUserStore } from '@/store/useUserStore';
import { isSuperAdminRole } from '@/utils/RoleStrategyMap';

import {
  parseProfile,
  ProfileServiceError,
  userIdFromToken,
} from '@/services/profile/profile.mappers';

function resolveMockUser(token?: string): MockAuthUserRecord {
  const tokenUserId = userIdFromToken(token);
  if (tokenUserId) {
    const byToken = findMockUserById(tokenUserId);
    if (byToken) return byToken;
  }

  const activeUser = useUserStore.getState().activeUser;
  if (activeUser?.id) {
    const byId = findMockUserById(activeUser.id);
    if (byId) return byId;
  }
  if (activeUser?.mobile) {
    const byMobile = findMockUserByMobile(activeUser.mobile);
    if (byMobile) return byMobile;
  }

  throw new ProfileServiceError('پروفایل کاربری یافت نشد.', 404);
}

export function getMockProfile(token?: string): ProfileDto {
  return parseProfile(toPublicUser(resolveMockUser(token)));
}

export function updateMockProfile(
  data: ProfileDto,
  token?: string
): { success: boolean; message: string } {
  const validatedData = parseProfile(data);
  const current = resolveMockUser(token);
  const isSuperAdmin = isSuperAdminRole(validatedData.role);

  // اگر قبلاً `approved` بوده، ویرایش سازمانی او را به `pending_admin` برنگرداند.
  const keepApproved = !isSuperAdmin && current.docStatus === 'approved';

  const toArray = (v: string | string[] | undefined): string[] | undefined =>
    typeof v === 'string' ? (v ? [v] : []) : v;

  patchMockAuthUser(
    { id: current.id },
    {
      ...validatedData,
      province: toArray('province' in validatedData ? validatedData.province : undefined),
      college: 'college' in validatedData ? toArray(validatedData.college) : undefined,
      approved: isSuperAdmin || keepApproved,
      docStatus: isSuperAdmin
        ? 'approved'
        : keepApproved
          ? 'approved'
          : 'pending_admin',
      lastChange: Date.now(),
    }
  );

  return {
    success: true,
    message: 'اطلاعات پروفایل شما با موفقیت ذخیره شد.',
  };
}

export function updateMockIdentityDocument(
  documentBase64: string,
  token?: string
): void {
  const current = resolveMockUser(token);
  const trimmed = documentBase64.trim();
  if (!trimmed.startsWith('data:image/')) {
    throw new ProfileServiceError('فرمت تصویر مدرک هویتی معتبر نیست.');
  }

  const mimeMatch = /^data:image\/([a-z0-9.+-]+);base64,/i.exec(trimmed);
  const docType = mimeMatch?.[1]?.toLowerCase() ?? 'webp';

  patchMockAuthUser(
    { id: current.id },
    {
      docUrl: trimmed,
      docType,
      docStatus: 'pending_admin',
      approved: false,
      lastChange: Date.now(),
    }
  );
}