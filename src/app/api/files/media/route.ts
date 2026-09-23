import { NextRequest, NextResponse } from 'next/server';

import { hasEdgeClientSession } from '@/lib/edge-session';
import { fetchNestUpstream } from '@/lib/nest-upstream-fetch';
import { isAllowedSignedUploadTarget } from '@/lib/signed-upload-target';
import { storageFetchUrlCandidates } from '@/services/files/resolve-nest-file-url';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

const UPSTREAM_TIMEOUT_MS = 25_000;
const MAX_BYTES = 12 * 1024 * 1024;

// `nextUrl.searchParams.get` خودش یک‌بار decode می‌کند؛ decode دوبارهٔ اینجا escape
// داخلیِ URL امضاشدهٔ AWS (مثل `%2F` در X-Amz-Credential) را باز می‌کرد و امضای
// SigV4 را نامعتبر می‌کرد — S3 با 403 رد می‌کرد و پراکسی 502 برمی‌گرداند.
function readSrcParam(raw: string | null): string {
  return raw?.trim() ?? '';
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

function looksLikeStorageError(contentType: string, buffer: ArrayBuffer): boolean {
  if (contentType.includes('xml') || contentType.includes('json')) return true;
  const head = new TextDecoder('utf-8', { fatal: false })
    .decode(buffer.slice(0, 256))
    .trimStart()
    .toLowerCase();
  return (
    head.startsWith('<?xml') ||
    head.includes('<errormessage>') ||
    head.includes('<error>') ||
    head.includes('invalidaccesskeyid')
  );
}

async function fetchStorageObject(
  target: string,
  signal: AbortSignal
): Promise<{ buffer: ArrayBuffer; contentType: string } | null> {
  const upstream = await fetchNestUpstream(target, {
    method: 'GET',
    redirect: 'manual',
    signal,
  });
  if (!upstream.ok) return null;
  const buffer = await upstream.arrayBuffer();
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_BYTES) return null;
  const contentType = contentTypeFromUpstream(upstream, target);
  if (looksLikeStorageError(contentType, buffer)) return null;
  return { buffer, contentType };
}

/**
 * GET مدرک از باکت S3 با نشست همین دامنه — `<img>` نمی‌تواند Bearer به Nest/S3 بفرستد.
 * Nest اغلب GetObject را روی `*.amazonaws.com` امضا می‌کند؛ بایت را از `NEXT_PUBLIC_S3_URL` می‌خوانیم.
 */
export async function GET(request: NextRequest) {
  if (!hasEdgeClientSession(request.cookies)) {
    return NextResponse.json({ message: 'نشست یافت نشد.' }, { status: 401 });
  }

  const target = readSrcParam(request.nextUrl.searchParams.get('src'));
  const candidates = storageFetchUrlCandidates(target).filter((url) =>
    isAllowedSignedUploadTarget(url)
  );
  if (!target || candidates.length === 0) {
    return NextResponse.json({ message: 'آدرس فایل مجاز نیست.' }, { status: 400 });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    for (const url of candidates) {
      const result = await fetchStorageObject(url, controller.signal);
      if (!result) continue;
      return new NextResponse(result.buffer, {
        status: 200,
        headers: {
          'content-type': result.contentType,
          'cache-control': 'private, max-age=60, no-transform',
        },
      });
    }
    return NextResponse.json(
      { message: 'دریافت فایل از فضای ذخیره‌سازی ناموفق بود.' },
      { status: 502 }
    );
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
