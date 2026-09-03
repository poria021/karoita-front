import { NextRequest, NextResponse } from 'next/server';

import { readNestApiBaseUrl } from '@/lib/nest-proxy';

/** هدرهایی که از مرورگر به Nest نباید بروند. */
const SKIP_REQUEST_HEADER =
  /^(host|connection|keep-alive|proxy-authenticate|proxy-authorization|te|trailer|transfer-encoding|upgrade|cookie|content-length|content-encoding|accept-encoding)$/i;

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
  const target = `${base}/${suffix}${request.nextUrl.search}`;

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
    cache: 'no-store',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch {
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

  const body = await upstream.arrayBuffer();

  const response = new NextResponse(body, {
    status: upstream.status,
    headers: outHeaders,
  });
  response.headers.delete('content-encoding');
  return response;
}
