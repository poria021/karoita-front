import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

import { PUT } from '@/app/api/files/signed-put/route';
import { SIGNED_PUT_URL_HEADER } from '@/lib/signed-upload-target';

const SIGNED =
  'https://s3.example.com/bucket/a.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=sig';

function sameOriginPut(signedUrl: string, body: string): NextRequest {
  return new NextRequest('http://localhost/api/files/signed-put', {
    method: 'PUT',
    headers: {
      'content-type': 'image/webp',
      'sec-fetch-site': 'same-origin',
      [SIGNED_PUT_URL_HEADER]: encodeURIComponent(signedUrl),
    },
    body,
  });
}

describe('PUT /api/files/signed-put', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('forwards bytes to the signed URL and returns 204', async () => {
    const upstream = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', upstream);

    const response = await PUT(sameOriginPut(SIGNED, 'webp-bytes'));

    expect(response.status).toBe(204);
    expect(upstream).toHaveBeenCalledWith(
      SIGNED,
      expect.objectContaining({
        method: 'PUT',
        headers: { 'Content-Type': 'image/webp' },
      })
    );
  });

  it('rejects a missing signed URL', async () => {
    const response = await PUT(
      new NextRequest('http://localhost/api/files/signed-put', {
        method: 'PUT',
        headers: {
          'content-type': 'image/webp',
          'sec-fetch-site': 'same-origin',
        },
        body: 'x',
      })
    );
    expect(response.status).toBe(400);
  });
});
