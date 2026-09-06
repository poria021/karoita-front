import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  resolveNestFileUrl,
  storageFetchUrlCandidates,
  toSameOriginMediaUrl,
} from './resolve-nest-file-url';

describe('resolveNestFileUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns null for empty values', () => {
    expect(resolveNestFileUrl(null)).toBeNull();
    expect(resolveNestFileUrl('  ')).toBeNull();
  });

  it('leaves absolute and data URLs unchanged', () => {
    expect(resolveNestFileUrl('https://cdn.example.com/a.jpg')).toBe(
      'https://cdn.example.com/a.jpg'
    );
    expect(resolveNestFileUrl('data:image/png;base64,abc')).toBe(
      'data:image/png;base64,abc'
    );
  });

  it('rebases Amazon S3 signed URLs onto the public bucket origin', () => {
    expect(
      resolveNestFileUrl(
        'https://docs.s3.amazonaws.com/abc-uuid.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=EXAMPLE%2F20200101%2Fus-east-1%2Fs3%2Faws4_request',
        { s3Base: 'https://files.example.hs3.ir' }
      )
    ).toBe('https://files.example.hs3.ir/abc-uuid.jpg');
  });

  it('rebases Nest GetObject URLs that used the dummy AWS virtual host', () => {
    expect(
      resolveNestFileUrl(
        'https://file.s3.us-east-1.amazonaws.com/d45d8be46cd91c9b612d4.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=abc',
        { s3Base: 'https://karvita-bncdf.hs3.ir' }
      )
    ).toBe('https://karvita-bncdf.hs3.ir/d45d8be46cd91c9b612d4.jpg');
  });

  it('rebases path-style Amazon S3 URLs onto the public origin', () => {
    expect(
      resolveNestFileUrl(
        'https://s3.amazonaws.com/docs-bucket/abc-uuid.jpg?X-Amz-Signature=abc',
        { s3Base: 'https://files.example.hs3.ir' }
      )
    ).toBe('https://files.example.hs3.ir/docs-bucket/abc-uuid.jpg');
  });

  it('prefixes S3 object keys with the public bucket base', () => {
    expect(
      resolveNestFileUrl('abc-uuid.jpg', {
        s3Base: 'https://bucket.s3.ir-thr-at1.arvanstorage.ir',
      })
    ).toBe('https://bucket.s3.ir-thr-at1.arvanstorage.ir/abc-uuid.jpg');
  });

  it('rewrites Nest local-driver file paths onto the API prefix', () => {
    expect(
      resolveNestFileUrl('/api/v1/files/photo.jpg', {
        apiBase: 'https://api.example.com/api',
      })
    ).toBe('https://api.example.com/api/v1/files/photo.jpg');
  });

  it('keeps a same-origin storage signature instead of stripping it', () => {
    const signed =
      'https://files.example.hs3.ir/abc.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=sig';
    expect(
      resolveNestFileUrl(signed, { s3Base: 'https://files.example.hs3.ir' })
    ).toBe(signed);
  });

  it('leaves the same-origin media proxy path unchanged', () => {
    expect(
      resolveNestFileUrl('/api/files/media?src=https%3A%2F%2Ffiles.example.com%2Fa.jpg')
    ).toBe('/api/files/media?src=https%3A%2F%2Ffiles.example.com%2Fa.jpg');
  });
});

describe('toSameOriginMediaUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('wraps allowed storage URLs in the media proxy', () => {
    vi.stubEnv('NEXT_PUBLIC_S3_URL', 'https://files.example.com');
    expect(toSameOriginMediaUrl('https://files.example.com/id-doc.jpg')).toBe(
      '/api/files/media?src=https%3A%2F%2Ffiles.example.com%2Fid-doc.jpg'
    );
  });

  it('wraps the original signed AWS URL so the media proxy can fall back to private-bucket access', () => {
    vi.stubEnv('NEXT_PUBLIC_S3_URL', 'https://karvita-bncdf.hs3.ir');
    const signed =
      'https://file.s3.us-east-1.amazonaws.com/d45d8be46cd91c9b612d4.jpg?X-Amz-Signature=abc';
    expect(toSameOriginMediaUrl(signed)).toBe(
      `/api/files/media?src=${encodeURIComponent(signed)}`
    );
  });

  it('leaves data URLs unchanged', () => {
    expect(toSameOriginMediaUrl('data:image/jpeg;base64,abc')).toBe(
      'data:image/jpeg;base64,abc'
    );
  });
});

describe('storageFetchUrlCandidates', () => {
  it('puts the unsigned public origin first and keeps the signed AWS URL as fallback', () => {
    const signed =
      'https://file.s3.us-east-1.amazonaws.com/d45d8be46cd91c9b612d4.jpg?X-Amz-Signature=abc';
    expect(
      storageFetchUrlCandidates(signed, { s3Base: 'https://karvita-bncdf.hs3.ir' })
    ).toEqual([
      'https://karvita-bncdf.hs3.ir/d45d8be46cd91c9b612d4.jpg',
      'https://karvita-bncdf.hs3.ir/file/d45d8be46cd91c9b612d4.jpg',
      signed,
    ]);
  });
});
