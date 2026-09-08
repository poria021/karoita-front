import { NextRequest, NextResponse } from 'next/server';

import {
  getCatalogCache,
  getCatalogCacheTtl,
  invalidateCatalogCacheByPath,
  isMutationCacheRelated,
  setCatalogCache,
} from '@/lib/nest-catalog-cache';
import { readNestApiBaseUrl } from '@/lib/nest-proxy';
import {
  fetchNestUpstream,
  logNestUpstreamFailure,
} from '@/lib/nest-upstream-fetch';

/**
 * هدر مرورگر را به Nest نفرست — Origin لوکال / sec-fetch / x-forwarded
 * روی گیت‌وی Darkube اتصال را قطع می‌کند و ky فقط ۵۰۲ می‌بیند.
 */
const SKIP_REQUEST_HEADER =
  /^(host|connection|keep-alive|proxy-authenticate|proxy-authorization|te|trailer|transfer-encoding|upgrade|cookie|content-length|content-encoding|accept-encoding|origin|referer|sec-fetch-.*|sec-ch-ua.*|x-forwarded-.*|forwarded|via)$/i;

/**
 * فقط این‌ها به مرورگر برگردند.
 * `content-encoding` را هرگز کپی نکن — Node ممکن است gzip را باز کند
 * و هدر را نگه دارد؛ مرورگر بعد `ERR_CONTENT_DECODING_FAILED` می‌دهد
 * و ky آن را `TypeError` شبکه می‌بیند.
 */
const ALLOW_RESPONSE_HEADER =
  /^(content-type|cache-control|retry-after|www-authenticate|location)$/i;

function isUnsafePathSegment(segment: string): boolean {
  return segment === '..' || segment.includes('/') || segment.includes('\\');
}

/**
 * Fetch/Next برای 204/205/304 بدنه نمی‌پذیرند — حتی `ArrayBuffer` خالی.
 * Nest روی CRUD کاتالوگ 204 با JSON/etag می‌دهد؛ `new NextResponse(buf, { status: 204 })`
 * `TypeError` می‌دهد، روت پروکسی می‌ترکد، مرورگر «ارتباط با سرور برقرار نشد»
 * می‌بیند، در حالی که نوشتن روی Nest انجام شده.
 */
const NULL_BODY_STATUSES = new Set([204, 205, 304]);

export function nestProxyResponseBody(
  status: number,
  body: ArrayBuffer
): ArrayBuffer | null {
  return NULL_BODY_STATUSES.has(status) ? null : body;
}

export async function forwardToNestApi(
  request: NextRequest,
  pathSegments: string[]
): Promise<NextResponse> {
  if (pathSegments.some(isUnsafePathSegment)) {
    return NextResponse.json({ message: 'مسیر نامعتبر است.' }, { status: 400 });
  }

  const base = readNestApiBaseUrl();
  if (!base) {
    return NextResponse.json(
      { message: 'آدرس سرویس API پیکربندی نشده است.' },
      { status: 502 }
    );
  }

  const suffix = pathSegments.join('/');
  const pathWithQuery = `${suffix}${request.nextUrl.search}`;
  const target = `${base}/${pathWithQuery}`;

  // Cache hit: فقط برای GET‌های catalog — endpoint‌هایی که داده‌شان برای همه
  // کاربران یکسان است. POST/PATCH/DELETE هرگز cache نمی‌شوند.
  if (request.method === 'GET') {
    const ttlMs = getCatalogCacheTtl(pathWithQuery);
    if (ttlMs !== null) {
      const cached = getCatalogCache(pathWithQuery);
      if (cached) {
        const ttlSec = Math.floor(ttlMs / 1000);
        return new NextResponse(cached.body, {
          status: cached.status,
          headers: {
            'content-type': cached.contentType,
            'cache-control': `public, s-maxage=${ttlSec}, stale-while-revalidate=${Math.floor(ttlSec / 2)}`,
            'x-karvita-proxy': 'nest-catalog-cache',
          },
        });
      }
    }
  }

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (SKIP_REQUEST_HEADER.test(key)) return;
    headers.set(key, value);
  });
  // Nest را مجبور کن JSON خام بدهد تا gzip/br با بدنهٔ بازشده قاطی نشود.
  headers.set('accept-encoding', 'identity');

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetchNestUpstream(target, init);
  } catch (error) {
    logNestUpstreamFailure('nest-proxy', error);
    return NextResponse.json(
      { message: 'ارتباط با سرویس API برقرار نشد.' },
      { status: 502 }
    );
  }

  const outHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!ALLOW_RESPONSE_HEADER.test(key)) return;
    outHeaders.append(key, value);
  });
  // no-transform: Next/nginx/پروکسی محلی (مثل 127.0.0.1:10808) حق gzip دوباره ندارند.
  outHeaders.set('cache-control', 'no-store, no-transform');
  outHeaders.delete('content-encoding');
  outHeaders.delete('content-length');
  outHeaders.set('x-karvita-proxy', 'nest-raw');

  let rawBody = new ArrayBuffer(0);
  try {
    rawBody = await upstream.arrayBuffer();
  } catch {
    // بعضی runtimeها خواندن بدنهٔ غیرمجاز روی 204 را رد می‌کنند.
  }
  const status = upstream.status;
  const body = nestProxyResponseBody(status, rawBody);

  // Mutation موفق روی یک cacheable path → cache مربوطه را باطل کن
  // تا ادمین بلافاصله داده به‌روز را ببیند (نه داده stale تا انقضای TTL).
  const isMutation = request.method === 'POST' || request.method === 'PUT' ||
    request.method === 'PATCH' || request.method === 'DELETE';
  if (isMutation && status >= 200 && status < 300) {
    if (isMutationCacheRelated(suffix) || isMutationCacheRelated(pathWithQuery)) {
      invalidateCatalogCacheByPath(suffix);
    }
  }

  // Cache miss را پر کن — فقط برای موفق‌ترین GETهای catalog (200 + JSON)
  if (request.method === 'GET' && status === 200 && rawBody.byteLength > 0) {
    const ttlMs = getCatalogCacheTtl(pathWithQuery);
    if (ttlMs !== null) {
      const contentType = upstream.headers.get('content-type') ?? 'application/json';
      if (contentType.includes('json')) {
        const bodyText = new TextDecoder().decode(rawBody);
        setCatalogCache(pathWithQuery, {
          body: bodyText,
          contentType,
          status,
          ttlMs,
        });
      }
    }
  }

  try {
    const response = new NextResponse(body, {
      status,
      headers: outHeaders,
    });
    response.headers.delete('content-encoding');
    return response;
  } catch {
    // اگر وضعیت null-body هنوز هم constructor را بترکاند، بدون بدنه برگردان
    // تا write موفق Nest به Failed to fetch تبدیل نشود.
    if (NULL_BODY_STATUSES.has(status)) {
      const fallback = new NextResponse(null, { status, headers: outHeaders });
      fallback.headers.delete('content-encoding');
      return fallback;
    }
    return NextResponse.json(
      { message: 'ارتباط با سرویس API برقرار نشد.' },
      { status: 502 }
    );
  }
}
