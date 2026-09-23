import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

import { AUTH_COOKIE_NAME } from '@/lib/config';
import { GET } from '@/app/api/files/media/route';

function mediaRequest(src: string, loggedIn = true): NextRequest {
  const url = `http://localhost/api/files/media?src=${encodeURIComponent(src)}`;
  const headers = new Headers();
  if (loggedIn) {
    headers.set('cookie', `${AUTH_COOKIE_NAME}=1`);
  }
  return new NextRequest(url, { method: 'GET', headers });
}

describe('GET /api/files/media', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('rejects unauthenticated requests', async () => {
    const response = await GET(
      mediaRequest('https://files.example.com/a.jpg', false)
    );
    expect(response.status).toBe(401);
  });

  it('rejects a target outside the storage origin', async () => {
    vi.stubEnv('NEXT_PUBLIC_S3_URL', 'https://files.example.com');
    const response = await GET(mediaRequest('https://evil.example/a.jpg'));
    expect(response.status).toBe(400);
  });

  it('streams bytes from the allowed storage origin', async () => {
    vi.stubEnv('NEXT_PUBLIC_S3_URL', 'https://files.example.com');
    const bytes = new Uint8Array([1, 2, 3]);
    const upstream = vi.fn(
      async () =>
        new Response(bytes, {
          status: 200,
          headers: { 'content-type': 'image/jpeg' },
        })
    );
    vi.stubGlobal('fetch', upstream);

    const response = await GET(
      mediaRequest('https://files.example.com/id-doc.jpg')
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/jpeg');
    expect(upstream).toHaveBeenCalledWith(
      'https://files.example.com/id-doc.jpg',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('rebases a dummy AWS GetObject URL onto the public bucket before fetching', async () => {
    vi.stubEnv('NEXT_PUBLIC_S3_URL', 'https://karvita-bncdf.hs3.ir');
    const bytes = new Uint8Array([1, 2, 3]);
    const upstream = vi.fn(
      async () =>
        new Response(bytes, {
          status: 200,
          headers: { 'content-type': 'image/jpeg' },
        })
    );
    vi.stubGlobal('fetch', upstream);

    const response = await GET(
      mediaRequest(
        'https://file.s3.us-east-1.amazonaws.com/d45d8be46cd91c9b612d4.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=abc'
      )
    );

    expect(response.status).toBe(200);
    expect(upstream).toHaveBeenCalledWith(
      'https://karvita-bncdf.hs3.ir/d45d8be46cd91c9b612d4.jpg',
      expect.objectContaining({ method: 'GET' })
    );
    expect(upstream).not.toHaveBeenCalledWith(
      expect.stringContaining('amazonaws.com'),
      expect.anything()
    );
  });

  it('preserves percent-encoding inside the signed AWS query string when falling back to it', async () => {
    // `nextUrl.searchParams.get('src')` already decodes the outer wrapper once;
    // a second `decodeURIComponent` here would unescape `%2F` inside
    // X-Amz-Credential to a literal `/`, invalidating the SigV4 signature and
    // making S3 reject the fallback request too (private-bucket photos 502).
    vi.stubEnv('NEXT_PUBLIC_S3_URL', 'https://karvita-bncdf.hs3.ir');
    const bytes = new Uint8Array([1, 2, 3]);
    const signed =
      'https://file.s3.us-east-1.amazonaws.com/d45d8be46cd91c9b612d4.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=abc%2F20260906%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=abc';
    const upstream = vi.fn(async (input: string) => {
      if (input === signed) {
        return new Response(bytes, {
          status: 200,
          headers: { 'content-type': 'image/jpeg' },
        });
      }
      // rebased unsigned candidate — private bucket rejects it
      return new Response('access denied', { status: 403 });
    });
    vi.stubGlobal('fetch', upstream);

    const response = await GET(mediaRequest(signed));

    expect(response.status).toBe(200);
    expect(upstream).toHaveBeenCalledWith(
      signed,
      expect.objectContaining({ method: 'GET' })
    );
  });
});
