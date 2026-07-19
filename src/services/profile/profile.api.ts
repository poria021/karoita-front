import { ApiClientError, apiClient } from '@/services/api-client';
import type { ProfileDTO } from '@/types/profile';

import { ProfileServiceError } from './profile.mappers';

export async function requestProfile(
  method: 'GET' | 'PUT',
  token?: string,
  data?: ProfileDTO
): Promise<unknown> {
  if (!apiClient.isConfigured) {
    throw new ProfileServiceError('آدرس سرویس پروفایل پیکربندی نشده است.');
  }

  try {
    if (method === 'GET') {
      return await apiClient.getJson<unknown>('profile', token);
    }
    return await apiClient.putJson<unknown>('profile', data, token);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw new ProfileServiceError(error.message, error.status);
    }
    throw error;
  }
}

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
