import { describe, expect, it } from 'vitest';

import { resolveRealAuthRestoreBoot } from '@/components/shared/shell/AppAuthGuard';
import { SessionTransientError } from '@/services/auth/real/real-auth.bridge';
import type { Session } from '@/types/auth';

const SESSION = { token: 't', user: { id: 'u1' } } as Session;

describe('resolveRealAuthRestoreBoot', () => {
  it('refresh موفق → authenticated (بدون ریدایرکت به لاگین)', async () => {
    await expect(
      resolveRealAuthRestoreBoot(async () => SESSION)
    ).resolves.toBe('authenticated');
  });

  it('refresh مرده (null) → unauthenticated تا Edge روی /auth/login گیر نکند', async () => {
    await expect(
      resolveRealAuthRestoreBoot(async () => null)
    ).resolves.toBe('unauthenticated');
  });

  it('refresh گذرا (۵۰۲/شبکه) → error نه unauthenticated', async () => {
    await expect(
      resolveRealAuthRestoreBoot(async () => {
        throw new SessionTransientError('سرور در دسترس نیست');
      })
    ).resolves.toBe('error');
  });
});
