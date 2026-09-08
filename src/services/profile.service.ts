import { isMockApiMode } from '@/lib/api-mode';
import { ApiClientError } from '@/services/api-client';
import { AuthService } from '@/services/auth.service';
import {
  patchMockAuthUser,
  toPublicUser,
} from '@/services/auth/mock/mock-auth.store';
import { isBrowsableMediaUrl } from '@/services/files/resolve-nest-file-url';
import type { ProfileDto } from '@/types/profile';
import { useUserStore } from '@/store/useUserStore';
import type { DocStatus, User, UserRole } from '@/types/auth';
import { isSuperAdminRole } from '@/utils/RoleStrategyMap';

import { requestProfile } from './profile/real/profile.api';
import {
  extractApiMessage,
  parseProfile,
  ProfileServiceError,
} from './profile/profile.mappers';
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
  province?: string | string[];
  college?: string | string[];
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
 * بعد از ذخیره: `super_admin` همیشه تأییدشده است.
 * اگر قبلاً `approved` بوده، ذخیرهٔ بعدی (مثلاً ویرایش استان) او را به `pending_admin` برنمی‌گرداند.
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

function syncActiveUserFromNest(
  nestUser: User,
  role: UserRole,
  photoPublicUrl?: string
): User {
  const activeUser = useUserStore.getState().activeUser;
  // Prefer the server-returned docUrl (may contain a fresh signed URL from Nest).
  // photoPublicUrl is derived from the upload's presigned PUT URL and is unsigned;
  // using it over the server's signed URL causes photo display failures on private buckets.
  const docUrl =
    nestUser.docUrl ??
    (photoPublicUrl && isBrowsableMediaUrl(photoPublicUrl)
      ? photoPublicUrl
      : undefined);

  const next: User = {
    ...(activeUser ?? nestUser),
    ...nestUser,
    ...(docUrl ? { docUrl } : {}),
    ...approvalFields(role, {
      approved: nestUser.approved,
      docStatus: nestUser.docStatus,
    }),
  };
  useUserStore.getState().setUser(next);
  return next;
}

/**
 * نمای پروفایل و پچ آنبوردینگ.
 * real: فقط Nest (`GET/PATCH v1/auth/me` + `PATCH v1/users/{id}` + Files برای مدرک).
 */
export class ProfileService {
  static async getProfile(token?: string): Promise<ProfileDto> {
    try {
      if (!isMockApiMode()) {
        const { profileDto } = await requestProfile('GET', token);
        return parseProfile(profileDto);
      }

      await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
      return getMockProfile(token);
    } catch (error) {
      throw friendlyError(error);
    }
  }

  static async updateProfile(
    data: ProfileDto,
    token?: string,
    /** شناسهٔ فایل بعد از آپلود — به PATCH Nest می‌رود تا `photo` لینک شود. */
    photoFileId?: string,
    /** URL مطلق از signed PUT اگر Nest فقط کلید S3 برگرداند. */
    photoPublicUrl?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const validatedData = parseProfile(data);

      if (!isMockApiMode()) {
        // نام/عکس روی auth/me؛ فیلد سازمانی روی users/{id}.
        await AuthService.updateMe({
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          ...(photoFileId ? { photo: { id: photoFileId } } : {}),
        });
        const { profileDto: payload, nestUser } = await requestProfile(
          'PUT',
          token,
          validatedData,
          photoFileId
        );
        if (!nestUser) {
          throw new ProfileServiceError(
            'پاسخ پروفایل از سرور نامعتبر است.'
          );
        }
        syncActiveUserFromNest(nestUser, validatedData.role, photoPublicUrl);
        const serverMessage = extractApiMessage(payload);
        return {
          success: true,
          message: serverMessage || 'اطلاعات پروفایل شما با موفقیت ذخیره شد.',
        };
      }

      await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
      return updateMockProfile(validatedData, token);
    } catch (error) {
      throw friendlyError(error);
    }
  }

  /** real: همان `updateProfile` → Nest؛ mock: پچ store. */
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
        throw new ProfileServiceError(
          'نشست کاربری یافت نشد. لطفاً دوباره وارد شوید.',
          401
        );
      }
      return next;
    }

    const toArray = (v: string | string[] | undefined): string[] | undefined =>
      typeof v === 'string' ? (v ? [v] : []) : v;

    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
    const updated = patchMockAuthUser(
      { id: activeUser.id },
      {
        ...validatedData,
        province: toArray('province' in validatedData ? validatedData.province : undefined),
        college: 'college' in validatedData ? toArray(validatedData.college) : undefined,
        ...approvalFields(validatedData.role, {
          approved: activeUser.approved,
          docStatus: activeUser.docStatus,
        }),
        lastChange: Date.now(),
      }
    );
    return toPublicUser(updated);
  }

  /**
   * mock: data-URL WebP در store.
   * real: این متد Nest ندارد — UI باید `FilesService.uploadFile` + `updateProfile(..., photoFileId)` بزند.
   */
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
        throw new ProfileServiceError(
          'در حالت اتصال به Nest، مدرک هویتی فقط از مسیر آپلود فایل و ذخیرهٔ پروفایل ثبت می‌شود.'
        );
      }

      await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
      updateMockIdentityDocument(documentBase64, token);
    } catch (error) {
      throw friendlyError(error);
    }
  }
}
