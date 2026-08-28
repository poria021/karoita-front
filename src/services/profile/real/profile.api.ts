import { ApiClientError, apiClient } from '@/services/api-client';
import { mapNestAuthUser } from '@/services/auth/real/nest-auth-mappers';
import { usersApi } from '@/services/users/users.api';
import { useUserStore } from '@/store/useUserStore';
import type { User } from '@/types/auth';
import type { ProfileDto } from '@/types/profile';

import { buildNestUpdateUserBody } from '../profile-real-payload';
import { ProfileServiceError } from './profile.mappers';

/**
 * Map Nest `/auth/me` response (NestUserDto) → ProfileDto shape.
 *
 * بک‌اند province، university، degree را به‌صورت آرایه‌ای از {_id, title} برمی‌گرداند.
 * mapNestAuthUser → readOrgArray این فرمت را handle می‌کند.
 */
function nestUserToProfileDto(raw: unknown): ProfileDto {
  try {
    const user = mapNestAuthUser(raw);
    const base = { firstName: user.firstName, lastName: user.lastName };

    switch (user.role) {
      case 'student':
        return {
          role: 'student',
          ...base,
          province: user.province ?? [],
          college: user.college ?? [],
          major: user.major ?? '',
          studentId: user.studentId ?? '',
        };
      case 'skill_learner':
        return {
          role: 'skill_learner',
          ...base,
          province: user.province ?? [],
          college: user.college ?? [],
          major: user.major ?? '',
          skillCode: user.skillCode ?? '',
        };
      case 'supervisor_professor':
        return {
          role: 'supervisor_professor',
          ...base,
          province: user.province ?? [],
          college: user.college ?? [],
          major: user.major ?? '',
          personalCode: user.personalCode ?? '',
        };
      case 'mentor_teacher':
        return {
          role: 'mentor_teacher',
          ...base,
          province: user.province ?? [],
          city: user.city ?? [],
          district: user.district ?? [],
          school: user.school ?? [],
          personalCode: user.personalCode ?? '',
        };
      case 'school_principal':
        return {
          role: 'school_principal',
          ...base,
          province: user.province ?? [],
          city: user.city ?? [],
          district: user.district ?? [],
          school: user.school ?? [],
          personalCode: user.personalCode ?? '',
        };
      case 'regional_edu_admin':
        return {
          role: 'regional_edu_admin',
          ...base,
          province: user.province ?? [],
          city: user.city ?? [],
          district: user.district ?? [],
          personalCode: user.personalCode ?? '',
        };
      case 'faculty_role':
        return {
          role: 'faculty_role',
          ...base,
          province: user.province ?? [],
          college: user.college ?? [],
        };
      case 'provincial_university':
        return {
          role: 'provincial_university',
          ...base,
          province: user.province ?? [],
        };
      case 'super_admin':
      case 'central_organization':
      case 'assistant_admin':
        return {
          role: user.role,
          ...base,
          province: user.province ?? [],
        };
      default:
        throw new ProfileServiceError('پاسخ پروفایل از سرور نامعتبر است.');
    }
  } catch (error) {
    if (error instanceof ProfileServiceError) throw error;
    throw new ProfileServiceError('پاسخ پروفایل از سرور نامعتبر است.');
  }
}

/**
 * Nest profile transport — used by ProfileService when API_MODE=real.
 * GET   → /api/v1/auth/me    (returns NestUserDto)
 * Identity write (firstName/lastName/photo) → PATCH /api/v1/auth/me
 *   is done in ProfileService.updateProfile via AuthService.updateMe.
 * Org write → PATCH /api/v1/users/{id} (NestUpdateUserDto) — AuthUpdateDto
 *   does not accept province/university/school/… and drops them silently.
 */
export async function requestProfile(
  method: 'GET' | 'PUT',
  token?: string,
  data?: ProfileDto,
  /** شناسهٔ فایل عکس بعد از آپلود به S3 — به NestUpdateUserDto.photo اضافه می‌شه. */
  photoFileId?: string
): Promise<{ profileDto: unknown; nestUser?: User }> {
  if (!apiClient.isConfigured) {
    throw new ProfileServiceError('آدرس سرویس پروفایل پیکربندی نشده است.');
  }

  try {
    if (method === 'GET') {
      const raw = await apiClient.getJson<unknown>('v1/auth/me', token);
      return { profileDto: nestUserToProfileDto(raw) };
    }

    if (!data) {
      throw new ProfileServiceError('اطلاعات پروفایل برای ذخیره ارسال نشده است.');
    }

    const activeUser = useUserStore.getState().activeUser;
    if (!activeUser) {
      throw new ProfileServiceError('نشست کاربری یافت نشد. لطفاً دوباره وارد شوید.', 401);
    }

    // هویت (نام، نام‌خانوادگی، عکس) با PATCH /api/v1/auth/me در
    // ProfileService.updateProfile نوشته می‌شود.
    //
    // ⚠️ PATCH /api/v1/auth/me (`NestAuthUpdateDto`) فیلدهای سازمانی
    // (استان، دانشکده، رشته، کد، شهر، منطقه، مدرسه) را نمی‌پذیرد و بی‌صدا
    // نادیده می‌گیرد. این‌ها فقط روی PATCH /api/v1/users/{id} ذخیره می‌شوند.
    const body = await buildNestUpdateUserBody(data, activeUser.docStatus, photoFileId);
    const raw = await usersApi.update(activeUser.id, body, token);
    // برای PUT، هم ProfileDto هم User کامل (با docUrl) رو برمیگردونیم
    // تا profile.service بتونه docUrl رو در store ذخیره کنه
    const nestUser = mapNestAuthUser(raw);
    return { profileDto: nestUserToProfileDto(raw), nestUser };
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw new ProfileServiceError(error.message, error.status);
    }
    throw error;
  }
}

/** PUT /profile/identity-document */
export async function requestIdentityDocument(
  documentBase64: string,
  token?: string
): Promise<void> {
  if (!apiClient.isConfigured) {
    throw new ProfileServiceError('آدرس سرویس پروفایل پیکربندی نشده است.');
  }

  try {
    await apiClient.putJson<unknown>(
      'profile/identity-document',
      { documentBase64 },
      token
    );
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw new ProfileServiceError(error.message, error.status);
    }
    throw error;
  }
}
