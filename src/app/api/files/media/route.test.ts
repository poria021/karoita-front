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
});
