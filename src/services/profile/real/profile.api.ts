import { ApiClientError, apiClient } from '@/services/api-client';
import { mapNestAuthUser } from '@/services/auth/real/nest-auth-mappers';
import { usersApi } from '@/services/users/users.api';
import { useUserStore } from '@/store/useUserStore';
import type { User } from '@/types/auth';
import type { ProfileDto } from '@/types/profile';

import { buildNestUpdateUserBody } from '../profile-real-payload';
import { ProfileServiceError } from '@/services/profile/profile.mappers';

/**
 * `GET /api/v1/auth/me` (`NestUserDto`) → `ProfileDto`.
 * استان/دانشکده/رشته آرایهٔ `{_id, title}` است؛ `mapNestAuthUser` آن را باز می‌کند.
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
 * GET → `/api/v1/auth/me`. هویت با `PATCH /api/v1/auth/me` در `ProfileService.updateProfile`.
 * فیلد سازمانی را آن DTO نمی‌پذیرد و بی‌صدا دور می‌اندازد — فقط `PATCH /api/v1/users/{id}`.
 */
export async function requestProfile(
  method: 'GET' | 'PUT',
  token?: string,
  data?: ProfileDto,
  /** شناسهٔ فایل بعد از آپلود S3 — به `NestUpdateUserDto.photo` می‌رود. */
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

    const body = await buildNestUpdateUserBody(data, activeUser.docStatus, photoFileId);
    const raw = await usersApi.update(activeUser.id, body, token);
    // `PUT` هم `ProfileDto` و هم User کامل (`docUrl`) برمی‌گرداند تا store ذخیره کند.
    const nestUser = mapNestAuthUser(raw);
    return { profileDto: nestUserToProfileDto(raw), nestUser };
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw new ProfileServiceError(error.message, error.status);
    }
    throw error;
  }
}
