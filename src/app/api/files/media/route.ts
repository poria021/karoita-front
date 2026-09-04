import { NextRequest, NextResponse } from 'next/server';

import { hasEdgeClientSession } from '@/lib/edge-session';
import { isAllowedSignedUploadTarget } from '@/lib/signed-upload-target';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

const UPSTREAM_TIMEOUT_MS = 25_000;
const MAX_BYTES = 12 * 1024 * 1024;

function decodeSrc(raw: string | null): string {
  if (!raw?.trim()) return '';
  try {
    return decodeURIComponent(raw.trim());
  } catch {
    return raw.trim();
  }
}

function contentTypeFromUpstream(upstream: Response, target: string): string {
  const header = upstream.headers.get('content-type')?.split(';')[0]?.trim();
  if (header && !header.includes('application/xml') && header !== 'application/json') {
    return header;
  }
  const path = (() => {
    try {
      return new URL(target).pathname.toLowerCase();
    } catch {
      return '';
    }
  })();
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.webp')) return 'image/webp';
  if (path.endsWith('.gif')) return 'image/gif';
  if (path.endsWith('.pdf')) return 'application/pdf';
  return 'image/jpeg';
}

/**
 * GET مدرک از باکت S3 با نشست همین دامنه — `<img>` نمی‌تواند Bearer به Nest/S3 بفرستد.
 */
export async function GET(request: NextRequest) {
  if (!hasEdgeClientSession(request.cookies)) {
    return NextResponse.json({ message: 'نشست یافت نشد.' }, { status: 401 });
  }

  const target = decodeSrc(request.nextUrl.searchParams.get('src'));
  if (!target || !isAllowedSignedUploadTarget(target)) {
    return NextResponse.json({ message: 'آدرس فایل مجاز نیست.' }, { status: 400 });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const upstream = await fetch(target, {
      method: 'GET',
      redirect: 'manual',
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!upstream.ok) {
      return NextResponse.json(
        { message: 'دریافت فایل از فضای ذخیره‌سازی ناموفق بود.' },
        { status: 502 }
      );
    }

    const buffer = await upstream.arrayBuffer();
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_BYTES) {
      return NextResponse.json(
        { message: 'فایل مدرک نامعتبر است.' },
        { status: 502 }
      );
    }

    const contentType = contentTypeFromUpstream(upstream, target);
    if (contentType.includes('xml') || contentType.includes('json')) {
      return NextResponse.json(
        { message: 'دریافت فایل از فضای ذخیره‌سازی ناموفق بود.' },
        { status: 502 }
      );
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'content-type': contentType,
        'cache-control': 'private, max-age=60, no-transform',
      },
    });
  } catch (error) {
    const aborted =
      (typeof DOMException !== 'undefined' &&
        error instanceof DOMException &&
        error.name === 'AbortError') ||
      (error instanceof Error && error.name === 'AbortError');
    return NextResponse.json(
      {
        message: aborted
          ? 'دریافت فایل بیش از حد طول کشید.'
          : 'ارتباط با فضای ذخیره‌سازی فایل برقرار نشد.',
      },
      { status: aborted ? 504 : 502 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
