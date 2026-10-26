import { describe, expect, it } from 'vitest';

import {
  nextAccessRefreshDelayMs,
  shouldWarmAccessToken,
} from '@/lib/session-keep-alive';

describe('shouldWarmAccessToken', () => {
  it('warms when tab is visible, boot is authenticated, and token is due', () => {
    expect(
      shouldWarmAccessToken({
        boot: 'authenticated',
        msUntilRefresh: -1,
        visibilityState: 'visible',
      })
    ).toBe(true);
  });

  it('warms when memory has no token but boot says authenticated', () => {
    expect(
      shouldWarmAccessToken({
        boot: 'authenticated',
        msUntilRefresh: null,
        visibilityState: 'visible',
      })
    ).toBe(true);
  });

  it('does not warm while the tab is hidden', () => {
    expect(
      shouldWarmAccessToken({
        boot: 'authenticated',
        msUntilRefresh: -1,
        visibilityState: 'hidden',
      })
    ).toBe(false);
  });

  it('does not warm before boot finishes or when logged out', () => {
    expect(
      shouldWarmAccessToken({
        boot: null,
        msUntilRefresh: null,
        visibilityState: 'visible',
      })
    ).toBe(false);
    expect(
      shouldWarmAccessToken({
        boot: 'unauthenticated',
        msUntilRefresh: null,
        visibilityState: 'visible',
      })
    ).toBe(false);
  });

  it('does not warm when the access token is still fresh', () => {
    expect(
      shouldWarmAccessToken({
        boot: 'authenticated',
        msUntilRefresh: 60_000,
        visibilityState: 'visible',
      })
    ).toBe(false);
  });
});

describe('nextAccessRefreshDelayMs', () => {
  it('returns the positive delay and null when refresh is due or unknown', () => {
    expect(nextAccessRefreshDelayMs(12_000)).toBe(12_000);
    expect(nextAccessRefreshDelayMs(0)).toBeNull();
    expect(nextAccessRefreshDelayMs(-5)).toBeNull();
    expect(nextAccessRefreshDelayMs(null)).toBeNull();
  });
});
