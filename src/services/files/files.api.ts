import { apiClient, ApiClientError } from '@/services/api-client';
import { parseNestFileUploadResponse } from '@/services/files/parse-nest-file-upload';
import {
  SIGNED_PUT_PATH,
  SIGNED_PUT_URL_HEADER,
} from '@/lib/signed-upload-target';
import type {
  NestFileResponseDto,
  NestFileType,
  NestFileUploadDto,
} from '@/types/nest-users';

/** POST `/api/v1/files/upload`. */
export const NEST_FILES_PATH = 'v1/files/upload';

/** آپلود بایت — از timeout کوتاه JSON جداست. */
const SIGNED_UPLOAD_TIMEOUT_MS = 60_000;

async function putBytes(
  url: string,
  file: File,
  contentType: string,
  headers?: HeadersInit
): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    SIGNED_UPLOAD_TIMEOUT_MS
  );
  try {
    const res = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': contentType, ...headers },
      credentials: url.startsWith('/') ? 'same-origin' : 'omit',
      signal: controller.signal,
    });
    if (!res.ok) {
      let message = `آپلود فایل ناموفق بود (HTTP ${res.status}). لطفاً دوباره تلاش کنید.`;
      const contentTypeHeader = res.headers.get('content-type') ?? '';
      if (contentTypeHeader.includes('application/json')) {
        try {
          const payload = (await res.json()) as { message?: unknown };
          if (typeof payload.message === 'string' && payload.message.trim()) {
            message = payload.message.trim();
          }
        } catch {
          // همان پیام HTTP
        }
      }
      throw new ApiClientError(message, res.status);
    }
  } catch (error) {
    const aborted =
      (typeof DOMException !== 'undefined' &&
        error instanceof DOMException &&
        error.name === 'AbortError') ||
      (error instanceof Error && error.name === 'AbortError');
    if (aborted) {
      throw new ApiClientError(
        'آپلود فایل بیش از حد طول کشید. اتصال را بررسی کنید و دوباره تلاش کنید.'
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const filesApi = {
  /** مرحله ۱ — POST /api/v1/files/upload → ۲۰۱ `{ file, uploadSignedUrl }`. */
  async upload(body: NestFileUploadDto, token?: string) {
    const raw = await apiClient.postJson<unknown>(NEST_FILES_PATH, body, token);
    return parseNestFileUploadResponse(raw);
  },

  /**
   * مرحله ۲ — در مرورگر از `/api/files/signed-put` (هم‌مبدأ) تا CORS/CSP
   * `Failed to fetch` نسازد. روی سرور مستقیم به URL امضا.
   */
  async uploadToSignedUrl(
    signedUrl: string,
    file: File,
    contentType: string
  ): Promise<void> {
    if (typeof window !== 'undefined') {
      await putBytes(SIGNED_PUT_PATH, file, contentType, {
        [SIGNED_PUT_URL_HEADER]: encodeURIComponent(signedUrl),
      });
      return;
    }
    await putBytes(signedUrl, file, contentType);
  },

  /** مرحله ۳ — PATCH `/api/v1/files/{id}/confirm` بعد از PUT موفق. */
  confirm(fileId: string, token?: string) {
    return apiClient.patchMaybeJson<NestFileType>(
      `v1/files/${encodeURIComponent(fileId)}/confirm`,
      {},
      token
    );
  },
};

export type { NestFileResponseDto };
