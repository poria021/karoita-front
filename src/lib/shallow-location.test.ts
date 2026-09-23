import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getShallowLocationSearch,
  replaceShallowHref,
  resetShallowLocationForTests,
  subscribeShallowLocation,
} from '@/lib/shallow-location';

describe('shallow-location', () => {
  afterEach(() => {
    resetShallowLocationForTests();
    window.history.replaceState(null, '', '/org');
  });

  it('replaceShallowHref updates search without a new history entry', () => {
    window.history.replaceState(null, '', '/org');
    const lengthBefore = window.history.length;

    replaceShallowHref('/org?tab=cities');

    expect(window.location.pathname).toBe('/org');
    expect(window.location.search).toBe('?tab=cities');
    expect(window.history.length).toBe(lengthBefore);
  });

  it('replaceShallowHref is a no-op when href already matches', () => {
    window.history.replaceState({ keep: true }, '', '/org?tab=cities');
    const replaceSpy = vi.spyOn(window.history, 'replaceState');

    replaceShallowHref('/org?tab=cities');

    expect(replaceSpy).not.toHaveBeenCalled();
    replaceSpy.mockRestore();
  });

  it('notifies subscribers when search changes through replaceState', async () => {
    const listener = vi.fn();
    const unsubscribe = subscribeShallowLocation(listener);

    replaceShallowHref('/org?tab=districts');
    // emit() defers to a microtask so it never fires during useInsertionEffect.
    await Promise.resolve();

    expect(listener).toHaveBeenCalled();
    expect(getShallowLocationSearch()).toBe('?tab=districts');
    unsubscribe();
  });
});
