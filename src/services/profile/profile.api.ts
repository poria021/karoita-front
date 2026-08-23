import { ApiClientError, apiClient } from '@/services/api-client';
import { mapNestAuthUser } from '@/services/auth/nest-auth-mappers';
import type { ProfileDto } from '@/types/profile';

import { ProfileServiceError } from './profile.mappers';

/**
 * Map Nest `/auth/me` response (NestUserDto) → ProfileDto shape.
 *
 * ⚠️ توجه: بک‌اند فعلاً province و university/college و major/degree را در
 * پاسخ GET برنمی‌گرداند (فقط city/educationalDistrict/school/userUniqueId را
 * می‌دهد). این سه فیلد همچنان با رشته خالی پر می‌شوند تا وقتی بک‌اند آن‌ها را
 * به پاسخ اضافه کند — این محدودیت سمت فرانت قابل رفع نیست.
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
 * GET  → /api/v1/auth/me   (returns NestUserDto)
 * PATCH → /api/v1/auth/me  (AuthUpdateDto → NestUserDto)
 */
export async function requestProfile(
  method: 'GET' | 'PUT',
  token?: string,
  data?: ProfileDto
): Promise<unknown> {
  if (!apiClient.isConfigured) {
    throw new ProfileServiceError('آدرس سرویس پروفایل پیکربندی نشده است.');
  }

  try {
    if (method === 'GET') {
      const raw = await apiClient.getJson<unknown>('v1/auth/me', token);
      return nestUserToProfileDto(raw);
    }
    // PATCH /api/v1/auth/me — map ProfileDto fields to AuthUpdateDto
    const body: Record<string, unknown> = {};
    if (data?.firstName) body.firstName = data.firstName;
    if (data?.lastName) body.lastName = data.lastName;
    const raw = await apiClient.patchJson<unknown>('v1/auth/me', body, token);
    return nestUserToProfileDto(raw);
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
