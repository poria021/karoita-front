import { afterEach, describe, expect, it, vi } from 'vitest';

import { isAllowedSignedUploadTarget } from '@/lib/signed-upload-target';

describe('isAllowedSignedUploadTarget', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('allows https URLs with an S3 signature query', () => {
    expect(
      isAllowedSignedUploadTarget(
        'https://minio.darkube.ir/bucket/a.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=abc'
      )
    ).toBe(true);
  });

  it('allows the configured public S3 origin even without query', () => {
    vi.stubEnv('NEXT_PUBLIC_S3_URL', 'https://your-bucket.hs3.ir');
    expect(
      isAllowedSignedUploadTarget('https://your-bucket.hs3.ir/users/a.webp')
    ).toBe(true);
  });

  it('blocks link-local metadata hosts in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(
      isAllowedSignedUploadTarget(
        'https://169.254.169.254/latest/meta-data?X-Amz-Signature=x'
      )
    ).toBe(false);
  });
});
