/**
 * خطای ky → `ApiClientError` با پیام فارسی.
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPersianMessage(message: string): boolean {
  return /[\u0600-\u06FF]/.test(message);
}

function extractApiMessage(payload: unknown): string | null {
  if (!isRecord(payload)) return null;

  if (typeof payload.message === 'string') return payload.message;

  if (Array.isArray(payload.message)) {
    const messages = payload.message.filter(
      (m): m is string => typeof m === 'string'
    );
    return messages.length > 0 ? messages.join('، ') : null;
  }

  if (Array.isArray(payload.errors)) {
    const messages = payload.errors
      .flatMap((entry) => {
        if (typeof entry === 'string') return [entry];
        if (isRecord(entry) && typeof entry.message === 'string') {
          return [entry.message];
        }
        return [];
      })
      .filter(Boolean);
    return messages.length > 0 ? messages.join('، ') : null;
  }

  if (isRecord(payload.errors)) {
    const mapped = Object.entries(payload.errors)
      .map(([key, value]) => {
        if (typeof value !== 'string') return null;
        const lower = value.toLowerCase();
        // Nest فیلد OTP را `hash` می‌گذارد؛ ۴۰۴ با `invalidOtp` را پیام «منبع یافت نشد» نکن.
        if (key.toLowerCase() === 'hash' || /invalid.?otp/i.test(value)) {
          return 'کد تایید وارد‌شده اشتباه یا منقضی شده است.';
        }
        if (lower === 'notfound' || lower.includes('not found')) {
          return 'کاربری با این شماره یافت نشد.';
        }
        if (/phone/i.test(value) || /11-digit/i.test(value)) {
          return 'فرمت شماره موبایل معتبر نیست.';
        }
        return isPersianMessage(value) ? value : null;
      })
      .filter((v): v is string => Boolean(v));
    if (mapped.length > 0) return mapped.join('، ');
  }

  return typeof payload.error === 'string' ? payload.error : null;
}

/** Nest روی `verify-otp` برای کد اشتباه/منقضی ۴۰۴ می‌دهد — حتی با بدنهٔ خالی؛ پیام عمومی ۴۰۴ نده. */
const OTP_VERIFY_URL_HINT = 'verify-otp';
const OTP_RESET_URL_HINT = 'reset/password';

function isOtpAuthUrl(url: string | undefined): boolean {
  if (typeof url !== 'string') return false;
  return url.includes(OTP_VERIFY_URL_HINT) || url.includes(OTP_RESET_URL_HINT);
}

function defaultStatusMessage(status: number, url?: string): string {
  if (status === 404 && isOtpAuthUrl(url)) {
    return 'کد تایید وارد‌شده اشتباه یا منقضی شده است.';
  }
  if (status === 400) return 'اطلاعات ارسال‌شده معتبر نیست. لطفاً فیلدها را بررسی کنید.';
  if (status === 401) return 'نشست شما منقضی شده است. لطفاً دوباره وارد شوید.';
  if (status === 403) return 'شما اجازه انجام این عملیات را ندارید.';
  if (status === 404) return 'منبع درخواستی یافت نشد.';
  if (status === 409) return 'اطلاعات با داده‌های موجود تداخل دارد.';
  if (status === 413) return 'حجم فایل ارسالی بیش از حد مجاز است.';
  if (status === 422) return 'اطلاعات ارسال‌شده توسط سرور پذیرفته نشد. لطفاً فرم را بررسی کنید.';
  if (status >= 500) return 'سرویس موقتاً در دسترس نیست. لطفاً کمی بعد تلاش کنید.';
  return 'انجام عملیات با خطا مواجه شد.';
}

export function localizeApiError(payload: unknown, status: number, url?: string): string {
  const serverMessage = extractApiMessage(payload);
  return serverMessage && isPersianMessage(serverMessage)
    ? serverMessage
    : defaultStatusMessage(status, url);
}

export async function mapHttpError(error: unknown): Promise<never> {
  if (error instanceof HTTPError) {
    let payload: unknown = null;
    let rawText: string | null = null;
    try {
      // اول `text()` نه `json()` تا بدنهٔ غیرJSON (صفحهٔ ۴۰۴ Next/gateway) در لاگ گم نشود.
      rawText = await error.response.text();
      payload = rawText.trim() ? JSON.parse(rawText) : null;
    } catch {
      payload = null;
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
      'ارتباط با سرویس احراز هویت برقرار نشد. اگر همین صفحه را تازه ری‌استارت کرده‌اید، چند ثانیه صبر کنید و دوباره تلاش کنید.'
    );
  }

  if (error instanceof TypeError) {
    throw new ApiClientError(
      'ارتباط با سرویس برقرار نشد. اتصال اینترنت را بررسی کنید.'
    );
  }

  throw new ApiClientError(
    error instanceof Error && error.message
      ? error.message
      : 'خطایی غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.'
  );
}
