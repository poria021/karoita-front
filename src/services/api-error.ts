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

const GENERIC_HTTP_PHRASES = new Set([
  'bad request',
  'unauthorized',
  'forbidden',
  'not found',
  'method not allowed',
  'conflict',
  'unprocessable entity',
  'internal server error',
  'gateway timeout',
  'service unavailable',
  'too many requests',
  'unsupported media type',
  'payload too large',
  'precondition failed',
]);

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
  const seen = new Set<string>();
  const cleaned: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    cleaned.push(trimmed);
  }
  return cleaned.length > 0 ? cleaned.join('، ') : null;
}

function isGenericHttpPhrase(value: string): boolean {
  return GENERIC_HTTP_PHRASES.has(value.trim().toLowerCase());
}

function collectValidationStrings(value: unknown, depth: number): string[] {
  if (depth > 4) return [];
  if (typeof value === 'string') {
    const cleaned = cleanMessage(value);
    return cleaned ? [cleaned] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectValidationStrings(item, depth + 1));
  }

  const rec = asRecord(value);
  if (!rec) return [];

  const out: string[] = [];
  if (typeof rec.message === 'string') {
    const cleaned = cleanMessage(rec.message);
    if (cleaned) out.push(cleaned);
  }

  const constraints = asRecord(rec.constraints);
  if (constraints) {
    for (const item of Object.values(constraints)) {
      out.push(...collectValidationStrings(item, depth + 1));
    }
  }

  if (Array.isArray(rec.children)) {
    out.push(...collectValidationStrings(rec.children, depth + 1));
  }

  if (out.length === 0) {
    for (const item of Object.values(rec)) {
      if (typeof item === 'string' || Array.isArray(item) || asRecord(item)) {
        out.push(...collectValidationStrings(item, depth + 1));
      }
    }
  }

  return out;
}

function collectFromMessageField(message: unknown): string[] {
  if (typeof message === 'string') {
    const cleaned = cleanMessage(message);
    return cleaned ? [cleaned] : [];
  }
  if (Array.isArray(message)) {
    return message.flatMap((item) => collectValidationStrings(item, 0));
  }

  const rec = asRecord(message);
  if (!rec) return [];

  if (typeof rec.fa === 'string') {
    const fa = cleanMessage(rec.fa);
    if (fa) return [fa];
  }
  if (typeof rec.message === 'string') {
    const nested = cleanMessage(rec.message);
    if (nested) return [nested];
  }
  return Object.values(rec).flatMap((item) =>
    typeof item === 'string' && cleanMessage(item) ? [item.trim()] : []
  );
}

function collectFromRecord(rec: Record<string, unknown>, depth: number): string[] {
  if (depth > 3) return [];

  const specific: string[] = [];
  const generic: string[] = [];

  const pushAll = (values: string[]) => {
    for (const value of values) {
      if (isGenericHttpPhrase(value) || /^\d{3}$/.test(value)) {
        generic.push(value);
      } else {
        specific.push(value);
      }
    }
  };

  pushAll(collectFromMessageField(rec.message));
  if (typeof rec.msg === 'string') pushAll(collectFromMessageField(rec.msg));
  if (typeof rec.errorMessage === 'string') {
    pushAll(collectFromMessageField(rec.errorMessage));
  }
  if (Array.isArray(rec.messages)) {
    pushAll(collectValidationStrings(rec.messages, 0));
  }
  if (typeof rec.detail === 'string') pushAll(collectFromMessageField(rec.detail));

  if (Array.isArray(rec.errors) || asRecord(rec.errors)) {
    pushAll(collectValidationStrings(rec.errors, 0));
  }

  if (typeof rec.error === 'string') pushAll(collectFromMessageField(rec.error));

  const errorObj = asRecord(rec.error);
  if (errorObj) pushAll(collectFromRecord(errorObj, depth + 1));

  const dataObj = asRecord(rec.data);
  if (dataObj) pushAll(collectFromRecord(dataObj, depth + 1));

  return specific.length > 0 ? specific : generic;
}

/** متن خام Nest: `message` / `errors` / `error` / `detail` — بدون بازنویسی. */
export function extractApiMessage(payload: unknown): string | null {
  if (typeof payload === 'string') return cleanMessage(payload);

  const rec = asRecord(payload);
  if (!rec) return null;

  return joinMessages(collectFromRecord(rec, 0));
}

/**
 * فقط متن خود ریسپانس: بدنهٔ Nest، وگرنه statusText، وگرنه کد وضعیت.
 * فرانت پیام دامنه نمی‌سازد.
 */
export function localizeApiError(
  payload: unknown,
  status: number,
  _url?: string,
  httpStatusText?: string
): string {
  const fromBody = extractApiMessage(payload);
  if (fromBody) return fromBody;
  const fromStatusText = httpStatusText?.trim();
  if (fromStatusText) return fromStatusText;
  return String(status);
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
      localizeApiError(
        payload,
        error.response.status,
        error.response.url,
        error.response.statusText
      ),
      error.response.status,
      payload
    );
  }

  if (error instanceof ApiClientError) throw error;

  if (error instanceof TimeoutError || error instanceof NetworkError) {
    throw new ApiClientError(error.message);
  }

  if (error instanceof Error && error.message) {
    throw new ApiClientError(error.message);
  }

  throw new ApiClientError(String(error));
}
