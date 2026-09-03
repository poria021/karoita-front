import { NextRequest, NextResponse } from 'next/server';

import { readNestApiBaseUrl } from '@/lib/nest-proxy';

const SKIP_HEADER =
  /^(host|connection|keep-alive|proxy-authenticate|proxy-authorization|te|trailer|transfer-encoding|upgrade|cookie|content-length|content-encoding)$/i;

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
    if (SKIP_HEADER.test(key)) return;
    headers.set(key, value);
  });

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
    if (SKIP_HEADER.test(key) || key.toLowerCase() === 'set-cookie') return;
    outHeaders.append(key, value);
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: outHeaders,
  });
}
