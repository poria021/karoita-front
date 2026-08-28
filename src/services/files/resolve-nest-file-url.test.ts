import { afterEach, describe, expect, it, vi } from 'vitest';

import { resolveNestFileUrl } from './resolve-nest-file-url';

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
    ).toBe('https://files.example.hs3.ir/docs/abc-uuid.jpg');
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
});
