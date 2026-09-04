/**
 * خطای ky → `ApiClientError`.
 * متن HTTP را از بدنهٔ Nest می‌خوانیم؛ فرانت برای پاسخ سرور پیام دامنه نمی‌سازد.
 */
import { HTTPError, NetworkError, TimeoutError } from 'ky';

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly payload?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/** فقط وقتی بدنهٔ HTTP پیامی ندارد — نه ترجمهٔ دامنه. */
export const EMPTY_HTTP_ERROR_MESSAGE = 'عملیات ناموفق بود.';

function isRecord(value: unknown): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? (value as Record<string, unknown>) : null;
}

function cleanMessage(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function joinMessages(values: string[]): string | null {
  const cleaned = values
    .map((value) => value.trim())
    .filter(Boolean);
  return cleaned.length > 0 ? cleaned.join('، ') : null;
}

/** متن خام Nest: `message` / `errors` / `error` / `detail` — بدون بازنویسی. */
export function extractApiMessage(payload: unknown): string | null {
  if (typeof payload === 'string') return cleanMessage(payload);

  const rec = asRecord(payload);
  if (!rec) return null;

  if (typeof rec.message === 'string') return cleanMessage(rec.message);

  if (Array.isArray(rec.message)) {
    const fromMessage = joinMessages(
      rec.message.filter((item): item is string => typeof item === 'string')
    );
    if (fromMessage) return fromMessage;
  }

  if (Array.isArray(rec.errors)) {
    const fromErrors = joinMessages(
      rec.errors.flatMap((entry) => {
        if (typeof entry === 'string') return [entry];
        const item = asRecord(entry);
        return typeof item?.message === 'string' ? [item.message] : [];
      })
    );
    if (fromErrors) return fromErrors;
  }

  const errors = asRecord(rec.errors);
  if (errors) {
    const fromErrorMap = joinMessages(
      Object.values(errors).filter((value): value is string => typeof value === 'string')
    );
    if (fromErrorMap) return fromErrorMap;
  }

  if (typeof rec.detail === 'string') return cleanMessage(rec.detail);
  if (typeof rec.error === 'string') return cleanMessage(rec.error);

  return null;
}

/** پیام HTTP سرور؛ اگر بدنه خالی باشد فقط یک fallback خنثی. `url` برای سازگاری callerها مانده. */
export function localizeApiError(
  payload: unknown,
  _status: number,
  _url?: string
): string {
  return extractApiMessage(payload) ?? EMPTY_HTTP_ERROR_MESSAGE;
}

export async function mapHttpError(error: unknown): Promise<never> {
  if (error instanceof HTTPError) {
    let payload: unknown = null;
    let rawText: string | null = null;
    try {
      rawText = await error.response.text();
      payload = rawText.trim() ? JSON.parse(rawText) : rawText.trim() || null;
    } catch {
      payload = rawText?.trim() || null;
    }
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        `[api-error] HTTP ${error.response.status} → ${error.response.url}`,
        payload ?? rawText
      );
    }
    throw new ApiClientError(
      localizeApiError(payload, error.response.status, error.response.url),
      error.response.status,
      payload
    );
  }

  if (error instanceof ApiClientError) throw error;

  if (error instanceof TimeoutError) {
    throw new ApiClientError(
      'پاسخ سرویس بیش از حد طول کشید. لطفاً دوباره تلاش کنید.'
    );
  }

  if (error instanceof NetworkError) {
    throw new ApiClientError(
      'ارتباط با سرویس برقرار نشد. اتصال را بررسی کنید و دوباره تلاش کنید.'
    );
  }

  if (error instanceof TypeError) {
    throw new ApiClientError(
      'ارتباط با سرویس برقرار نشد. اتصال را بررسی کنید و دوباره تلاش کنید.'
    );
  }

  throw new ApiClientError(
    error instanceof Error && error.message
      ? error.message
      : EMPTY_HTTP_ERROR_MESSAGE
  );
}
