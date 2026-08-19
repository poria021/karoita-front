import { ApiClientError, apiClient } from '@/services/api-client';
import { mapNestAuthUser } from '@/services/auth/nest-auth-mappers';
import type { ProfileDto } from '@/types/profile';

import { ProfileServiceError } from './profile.mappers';

/**
 * Map Nest `/auth/me` response (NestUserDto) → ProfileDto shape.
 * Fields not in Nest (province, district, school, etc.) fall back to empty.
 */
function nestUserToProfileDto(raw: unknown): ProfileDto {
  try {
    const user = mapNestAuthUser(raw);
    return {
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    } as ProfileDto;
  } catch {
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
