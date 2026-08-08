import { ApiClientError, apiClient } from '@/services/api-client';
import type { ProfileDto } from '@/types/profile';

import { ProfileServiceError } from './profile.mappers';

/** Nest profile transport — used by ProfileService when API_MODE=real. */
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
      // GET /profile
      return await apiClient.getJson<unknown>('profile', token);
    }
    // PUT /profile
    return await apiClient.putJson<unknown>('profile', data, token);
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
