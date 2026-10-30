import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { NestLoginTokens } from '@/services/auth/real/nest-auth-mappers';
import {
  clearRealAuthTokens,
  msUntilAccessRefreshNeeded,
  writeRealAuthTokens,
} from '@/services/auth/real/real-auth.tokens';

const TOKENS: NestLoginTokens = {
  token: 'access-token-1',
  refreshToken: 'refresh-token-1',
  tokenExpires: Date.now() + 15 * 60 * 1000,
};

describe('msUntilAccessRefreshNeeded', () => {
  beforeEach(() => {
    clearRealAuthTokens();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200 } as Response)
    );
  });

  afterEach(() => {
    clearRealAuthTokens();
    vi.unstubAllGlobals();
  });

  it('returns null when memory has no tokens', () => {
    expect(msUntilAccessRefreshNeeded()).toBeNull();
  });

  it('returns a positive delay while the token is still inside the skew window', async () => {
    await writeRealAuthTokens(
      { ...TOKENS, tokenExpires: Date.now() + 10 * 60_000 },
      'user'
    );
    const ms = msUntilAccessRefreshNeeded();
    expect(ms).not.toBeNull();
    expect(ms!).toBeGreaterThan(0);
    expect(ms!).toBeLessThanOrEqual(9 * 60_000);
  });

  it('returns a non-positive value when refresh is already due', async () => {
    await writeRealAuthTokens(
      { ...TOKENS, tokenExpires: Date.now() + 30_000 },
      'user'
    );
    const ms = msUntilAccessRefreshNeeded();
    expect(ms).not.toBeNull();
    expect(ms!).toBeLessThanOrEqual(0);
  });
});
