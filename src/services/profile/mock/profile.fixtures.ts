import {
  findMockUserById,
  findMockUserByMobile,
  toPublicUser,
} from '@/services/auth/mock/mock-auth.session';
import {
  parseProfile,
  ProfileServiceError,
} from '@/services/profile/profile.mappers';
import { useUserStore } from '@/store/useUserStore';
import type { User } from '@/types/auth';
import type { ProfileDto } from '@/types/profile';
import { isSuperAdminRole } from '@/utils/RoleStrategyMap';

function requireActiveUser(): User {
  const activeUser = useUserStore.getState().activeUser;
  const record =
    (activeUser?.id ? findMockUserById(activeUser.id) : undefined) ??
    (activeUser?.mobile ? findMockUserByMobile(activeUser.mobile) : undefined);
  if (!activeUser && !record) {
    throw new ProfileServiceError('پروفایل کاربری یافت نشد.', 404);
  }
  return activeUser ?? toPublicUser(record!);
}

const toArray = (v: string | string[] | undefined): string[] | undefined =>
  typeof v === 'string' ? (v ? [v] : []) : v;

/** بدون state: پروفایل کاربر فعال را برمی‌گرداند. */
export function getMockProfile(): ProfileDto {
  return parseProfile(requireActiveUser());
}

/**
 * بدون ذخیره‌سازی: نتیجه فقط روی کاربر فعال (حافظهٔ Zustand) اعمال می‌شود تا
 * جریان آنبوردینگ جلو برود؛ با reload از بین می‌رود.
 */
export function applyMockProfile(data: ProfileDto): User {
  const current = requireActiveUser();
  const isSuperAdmin = isSuperAdminRole(data.role);
  const keepApproved = !isSuperAdmin && current.docStatus === 'approved';

  const next: User = {
    ...current,
    ...data,
    province: toArray('province' in data ? data.province : undefined),
    college: 'college' in data ? toArray(data.college) : undefined,
    approved: isSuperAdmin || keepApproved,
    docStatus: isSuperAdmin || keepApproved ? 'approved' : 'pending_admin',
    lastChange: Date.now(),
  };
  useUserStore.getState().setUser(next);
  return next;
}

export function applyMockIdentityDocument(documentBase64: string): void {
  const current = requireActiveUser();
  const trimmed = documentBase64.trim();
  const mimeMatch = /^data:image\/([a-z0-9.+-]+);base64,/i.exec(trimmed);
  useUserStore.getState().setUser({
    ...current,
    docUrl: trimmed,
    docType: mimeMatch?.[1]?.toLowerCase() ?? 'webp',
    docStatus: 'pending_admin',
    approved: false,
    lastChange: Date.now(),
  });
}
