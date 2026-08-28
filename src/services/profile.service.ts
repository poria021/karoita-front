import { isMockApiMode, throwRealModeNotImplemented } from '@/lib/api-mode';
import { ApiClientError } from '@/services/api-client';
import {
  patchMockAuthUser,
  toPublicUser,
} from '@/services/auth/mock/mock-auth.store';
import { isBrowsableMediaUrl } from '@/services/files/resolve-nest-file-url';
import type { ProfileDto } from '@/types/profile';
import { useUserStore } from '@/store/useUserStore';
import type { DocStatus, User, UserRole } from '@/types/auth';
import { isSuperAdminRole } from '@/utils/RoleStrategyMap';

import {
  requestIdentityDocument,
  requestProfile,
} from './profile/real/profile.api';
import {
  extractApiMessage,
  extractApiPayload,
  isPersianMessage,
  parseProfile,
  ProfileServiceError,
} from './profile/real/profile.mappers';
import {
  getMockProfile,
  updateMockIdentityDocument,
  updateMockProfile,
} from './profile/mock/profile.mock';

const MOCK_DELAY_MS = 350;
const MAX_IDENTITY_BASE64_CHARS = 1_100_000;

export interface UpdateOnboardingProfilePayload {
  role: UserRole;
  firstName: string;
  lastName: string;
  province?: string[];
  college?: string[];
  major?: string;
  studentId?: string;
  skillCode?: string;
  personalCode?: string;
  district?: string[];
  school?: string[];
  city?: string[];
  identityDoc?: File | null;
}

/**
 * Determines approved/docStatus after a profile save.
 * - super_admin is always approved.
 * - Once a user is already `approved`, subsequent saves (e.g. editing org
 *   fields like province/city/district/school) must NOT push them back to
 *   `pending_admin` — approval status is preserved.
 * - Otherwise (not_submitted / rejected / pending_admin), a save puts the
 *   profile into pending_admin review, same as before.
 */
function approvalFields(
  role: UserRole,
  current?: { approved: boolean; docStatus: DocStatus }
): {
  approved: boolean;
  docStatus: DocStatus;
} {
  const isSuperAdmin = isSuperAdminRole(role);
  if (isSuperAdmin) {
    return { approved: true, docStatus: 'approved' };
  }
  if (current?.docStatus === 'approved') {
    return { approved: true, docStatus: 'approved' };
  }
  return { approved: false, docStatus: 'pending_admin' };
}

function friendlyError(error: unknown): Error {
  if (error instanceof ProfileServiceError) return error;
  if (error instanceof ApiClientError) {
    return new ProfileServiceError(error.message, error.status);
  }
  if (error instanceof TypeError) {
    return new Error(
      'ارتباط با سرویس پروفایل برقرار نشد. اتصال اینترنت را بررسی کنید.'
    );
  }
  return new Error(
    error instanceof Error && error.message
      ? error.message
      : 'خطایی غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.'
  );
}

/**
 * Profile facade — identity reads/writes + onboarding patch.
 * Mock and real keep the same public DTO shape.
 *
 * Nest map:
 * - GET  /profile
 * - PUT  /profile
 * - PUT  /profile/identity-document
 */
export class ProfileService {
  /** GET /profile */
  static async getProfile(token?: string): Promise<ProfileDto> {
    try {
      if (!isMockApiMode()) {
        const { profileDto } = await requestProfile('GET', token);
        return parseProfile(extractApiPayload(profileDto));
      }

      await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
      return getMockProfile(token);
    } catch (error) {
      throw friendlyError(error);
    }
  }

  /** PUT /profile */
  static async updateProfile(
    data: ProfileDto,
    token?: string,
    /** شناسهٔ فایل عکس بعد از آپلود — به Nest PATCH ارسال می‌شه که photo رو لینک کند. */
    photoFileId?: string,
    /** URL مطلق ساخته‌شده از signed PUT (اگر Nest فقط کلید S3 برگرداند). */
    photoPublicUrl?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const validatedData = parseProfile(data);

      if (!isMockApiMode()) {
        const { profileDto: payload, nestUser } = await requestProfile('PUT', token, validatedData, photoFileId);
        const serverMessage = extractApiMessage(payload);
        const activeUser = useUserStore.getState().activeUser;
        if (activeUser) {
          const nestDocUrl = nestUser?.docUrl;
          const docUrl =
            photoPublicUrl && isBrowsableMediaUrl(photoPublicUrl)
              ? photoPublicUrl
              : nestDocUrl;
          useUserStore.getState().setUser({
            ...activeUser,
            ...validatedData,
            ...(docUrl ? { docUrl } : {}),
            ...approvalFields(validatedData.role, {
              approved: activeUser.approved,
              docStatus: activeUser.docStatus,
            }),
          });
        }
        return {
          success: true,
          message:
            serverMessage && isPersianMessage(serverMessage)
              ? serverMessage
              : 'اطلاعات پروفایل شما با موفقیت ذخیره شد.',
        };
      }

      await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
      return updateMockProfile(validatedData, token);
    } catch (error) {
      throw friendlyError(error);
    }
  }

  /** Onboarding submit — real path reuses PUT /profile */
  static async updateOnboardingProfile(
    payload: UpdateOnboardingProfilePayload
  ): Promise<User> {
    const { identityDoc: _identityDoc, ...data } = payload;
    void _identityDoc;

    const activeUser = useUserStore.getState().activeUser;
    if (!activeUser) {
      throw new ProfileServiceError(
        'نشست کاربری یافت نشد. لطفاً دوباره وارد شوید.',
        401
      );
    }

    const validatedData = parseProfile(data);

    if (!isMockApiMode()) {
      await ProfileService.updateProfile(validatedData);
      const next = useUserStore.getState().activeUser;
      if (!next) {
        throwRealModeNotImplemented('ProfileService.updateOnboardingProfile');
      }
      return next;
    }

    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
    const updated = patchMockAuthUser(
      { id: activeUser.id },
      {
        ...validatedData,
        ...approvalFields(validatedData.role, {
          approved: activeUser.approved,
          docStatus: activeUser.docStatus,
        }),
        lastChange: Date.now(),
      }
    );
    return toPublicUser(updated);
  }

  /** PUT /profile/identity-document — WebP data-URL only */
  static async updateIdentityDocument(
    documentBase64: string,
    token?: string
  ): Promise<void> {
    try {
      if (!documentBase64.startsWith('data:image/webp;base64,')) {
        throw new ProfileServiceError('فرمت تصویر مدرک هویتی معتبر نیست.');
      }

      if (documentBase64.length > MAX_IDENTITY_BASE64_CHARS) {
        throw new ProfileServiceError(
          'حجم تصویر مدرک بیش از حد مجاز است. لطفاً تصویر کوچک‌تری انتخاب کنید.'
        );
      }

      if (!isMockApiMode()) {
        await requestIdentityDocument(documentBase64, token);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
      updateMockIdentityDocument(documentBase64, token);
    } catch (error) {
      throw friendlyError(error);
    }
  }
}