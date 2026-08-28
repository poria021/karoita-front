import { afterEach, describe, expect, it } from 'vitest';

import {
  beginEnteringApp,
  beginLeavingApp,
  clearAuthTransition,
  getAuthTransitionPhase,
} from '@/store/authTransition';
import { getRuntimeAuthBoot, resetRuntimeAuthBoot } from '@/store/sessionBoot';

afterEach(() => {
  clearAuthTransition();
  resetRuntimeAuthBoot();
});

describe('authTransition', () => {
  it('marks the runtime as authenticated when entering the app', () => {
    beginEnteringApp();
    expect(getAuthTransitionPhase()).toBe('entering');
    expect(getRuntimeAuthBoot()).toBe('authenticated');
  });

  it('keeps leaving distinct from idle so logout overlay can cover the shell', () => {
    beginLeavingApp();
    expect(getAuthTransitionPhase()).toBe('leaving');
    expect(getRuntimeAuthBoot()).toBeNull();
  });

  it('waitForNextPaint resolves on the next animation frame', async () => {
    const { waitForNextPaint } = await import('@/store/authTransition');
    await expect(waitForNextPaint()).resolves.toBeUndefined();
  });
});
