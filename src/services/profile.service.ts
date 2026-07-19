import { isMockApiMode, throwRealModeNotImplemented } from '@/lib/api-mode';
import { ApiClientError } from '@/services/api-client';
import {
  patchMockAuthUser,
  toPublicUser,
} from '@/services/auth/mock-auth.store';
import type { ProfileDTO } from '@/types/profile';
import { useUserStore } from '@/store/useUserStore';
import type { DocStatus, User, UserRole } from '@/types/auth';
import { isSuperAdminRole } from '@/utils/RoleStrategyMap';

import {
  requestIdentityDocument,
  requestProfile,
} from './profile/profile.api';
import {
  extractApiMessage,
  extractApiPayload,
  isPersianMessage,
  parseProfile,
  ProfileServiceError,
} from './profile/profile.mappers';
import {
  getMockProfile,
  updateMockIdentityDocument,
  updateMockProfile,
} from './profile/profile.mock';

const MOCK_DELAY_MS = 350;
/** Real API: reject oversized data-URL payloads (~1.1MB chars ≈ ~800KB binary). */
const MAX_IDENTITY_BASE64_CHARS = 1_100_000;

/**
 * Flat onboarding payload (Step 5.2). Same field set as ProfileDTO + optional File.
 * Identity binary stays in the UI until compressed to WebP data-URL.
 */
export interface UpdateOnboardingProfilePayload {
  role: UserRole;
  firstName: string;
  lastName: string;
  province?: string;
  college?: string;
  major?: string;
  studentId?: string;
  skillCode?: string;
  personalCode?: string;
  district?: string;
  school?: string;
  city?: string;
  /** Collected by ProfileForm; upload via {@link ProfileService.updateIdentityDocument}. */
  identityDoc?: File | null;
}

function approvalFields(role: UserRole): {
  approved: boolean;
  docStatus: DocStatus;
} {
  const isSuperAdmin = isSuperAdminRole(role);
  return {
    approved: isSuperAdmin,
    docStatus: (isSuperAdmin ? 'approved' : 'pending_admin') as DocStatus,
  };
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
 * Canonical Nest-ready profile Facade (rule 40).
 * Mock: single writer `patchMockAuthUser` (auth mock store + Zustand sync).
 * Real: `apiClient` profile endpoints.
 *
 * Prefer this over `UserService` — onboarding + portal identity share one path.
 */
export class ProfileService {
  static async getProfile(token?: string): Promise<ProfileDTO> {
    try {
      if (!isMockApiMode()) {
        const payload = await requestProfile('GET', token);
        return parseProfile(extractApiPayload(payload));
      }

      await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
      return getMockProfile(token);
    } catch (error) {
      throw friendlyError(error);
    }
  }

  static async updateProfile(
    data: ProfileDTO,
    token?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const validatedData = parseProfile(data);

      if (!isMockApiMode()) {
        const payload = await requestProfile('PUT', token, validatedData);
        const serverMessage = extractApiMessage(payload);
        const activeUser = useUserStore.getState().activeUser;
        if (activeUser) {
          useUserStore.getState().setUser({
            ...activeUser,
            ...validatedData,
            ...approvalFields(validatedData.role),
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

  /**
   * Onboarding Step 5.2 — persists fields and returns the public User.
   * Callers that also upload a document should compress then call
   * {@link updateIdentityDocument} separately (same as IdentityForm).
   */
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
        ...approvalFields(validatedData.role),
        lastChange: Date.now(),
      }
    );
    return toPublicUser(updated);
  }

  /** Saves the already-compressed WebP identity document through the facade. */
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
