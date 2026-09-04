import { NextRequest, NextResponse } from 'next/server';

import { assertSameOriginPost } from '@/lib/auth-origin-guard';
import {
  SIGNED_PUT_URL_HEADER,
  isAllowedSignedUploadTarget,
} from '@/lib/signed-upload-target';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const SIGNED_URL_HEADER = SIGNED_PUT_URL_HEADER;
const UPSTREAM_TIMEOUT_MS = 55_000;

function decodeSignedUrlHeader(raw: string | null): string {
  if (!raw?.trim()) return '';
  try {
    return decodeURIComponent(raw.trim());
  } catch {
    return raw.trim();
  }
}

/**
 * مرورگر PUT را به S3 نمی‌زند (CORS/CSP → Failed to fetch).
 * همین مسیر هم‌مبدأ بایت را با `Content-Type` presign به URL امضا می‌فرستد.
 */
export async function PUT(request: NextRequest) {
  const guard = assertSameOriginPost(request);
  if (!guard.ok) {
    return NextResponse.json({ message: guard.reason }, { status: guard.status });
  }

  const signedUrl = decodeSignedUrlHeader(request.headers.get(SIGNED_URL_HEADER));
  if (!signedUrl || !isAllowedSignedUploadTarget(signedUrl)) {
    return NextResponse.json(
      { message: 'آدرس آپلود فایل مجاز نیست.' },
      { status: 400 }
    );
  }

  const contentType =
    request.headers.get('content-type')?.split(';')[0]?.trim() ||
    'application/octet-stream';
  const body = await request.arrayBuffer();
  if (body.byteLength === 0) {
    return NextResponse.json({ message: 'فایل خالی است.' }, { status: 400 });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const upstream = await fetch(signedUrl, {
      method: 'PUT',
      body,
      headers: { 'Content-Type': contentType },
      redirect: 'manual',
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!upstream.ok) {
      return NextResponse.json(
        {
          message: `آپلود فایل ناموفق بود (HTTP ${upstream.status}). لطفاً دوباره تلاش کنید.`,
        },
        { status: 502 }
      );
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const aborted =
      (typeof DOMException !== 'undefined' &&
        error instanceof DOMException &&
        error.name === 'AbortError') ||
      (error instanceof Error && error.name === 'AbortError');
    return NextResponse.json(
      {
        message: aborted
          ? 'آپلود فایل بیش از حد طول کشید. اتصال را بررسی کنید و دوباره تلاش کنید.'
          : 'ارتباط با فضای ذخیره‌سازی فایل برقرار نشد.',
      },
      { status: aborted ? 504 : 502 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
