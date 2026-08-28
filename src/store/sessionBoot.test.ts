import { afterEach, describe, expect, it } from 'vitest';

import {
  ensureAuthRestore,
  getRuntimeAuthBoot,
  resetRuntimeAuthBoot,
  setRuntimeAuthBoot,
} from '@/store/sessionBoot';

afterEach(() => {
  resetRuntimeAuthBoot();
});

describe('sessionBoot', () => {
  it('returns a boot already decided in this JS runtime without calling restore', async () => {
    setRuntimeAuthBoot('authenticated');
    let called = 0;
    const boot = await ensureAuthRestore(async () => {
      called += 1;
      return 'unauthenticated';
    });
    expect(boot).toBe('authenticated');
    expect(called).toBe(0);
    expect(getRuntimeAuthBoot()).toBe('authenticated');
  });

  it('shares one in-flight restore across remounts', async () => {
    let called = 0;
    let release: (value: 'authenticated') => void = () => undefined;
    const restore = () => {
      called += 1;
      return new Promise<'authenticated'>((resolve) => {
        release = resolve;
      });
    };

    const first = ensureAuthRestore(restore);
    const second = ensureAuthRestore(restore);
    expect(called).toBe(1);

    release('authenticated');
    await expect(first).resolves.toBe('authenticated');
    await expect(second).resolves.toBe('authenticated');
    expect(getRuntimeAuthBoot()).toBe('authenticated');
  });

  it('does not let a late restore overwrite a login that won the race', async () => {
    let release: (value: 'unauthenticated') => void = () => undefined;
    const pending = ensureAuthRestore(
      () =>
        new Promise<'unauthenticated'>((resolve) => {
          release = resolve;
        })
    );

    setRuntimeAuthBoot('authenticated');
    release('unauthenticated');

    await expect(pending).resolves.toBe('authenticated');
    expect(getRuntimeAuthBoot()).toBe('authenticated');
  });
});
