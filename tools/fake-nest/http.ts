/**
 * انواع مشترک سرور جعلی Nest. هر handler دقیقاً یک عملیات Swagger را پیاده می‌کند؛
 * `router.register` اگر مسیر/متد در `openapi.snapshot.json` نباشد خطا می‌دهد.
 */
import type { HttpMethod } from './openapi';
import type { Session } from './store';

export type RouteContext = {
  method: HttpMethod;
  /** مسیر کامل واقعی درخواست (بدون query). */
  pathname: string;
  params: Record<string, string>;
  query: URLSearchParams;
  body: unknown;
  /** `null` برای endpointهای بدون نیاز به توکن یا توکن نامعتبر. */
  session: Session | null;
  /**
   * فقط برای مسیرهای `openapi.proposed.json`: وقتی برنامه روی بک‌اند واقعی است، توکن واقعی
   * در این سرور شناخته‌شده نیست؛ پروکسی نقش/نام کاربر را با `x-karvita-actor` می‌فرستد.
   */
  fakeActor?: { role: string; name: string };
};

export type RouteResult = { status: number; body?: unknown };

export type Handler = (
  context: RouteContext
) => RouteResult | Promise<RouteResult>;

/** خطای HTTP هم‌شکل Nest تا ky/ApiClientError همان پیام را بخواند. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly errors?: Record<string, string>
  ) {
    super(message);
  }

  toBody(): Record<string, unknown> {
    if (this.errors) return { status: this.status, errors: this.errors };
    return { statusCode: this.status, message: this.message };
  }
}

export function ok(body: unknown, status = 200): RouteResult {
  return { status, body };
}

export function noContent(): RouteResult {
  return { status: 204 };
}
