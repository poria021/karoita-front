import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  invalidateSharedReads,
  sharedRead,
  SHARED_READ_DEFAULT_TTL_MS,
} from './shared-read';

describe('sharedRead', () => {
  afterEach(() => {
    invalidateSharedReads();
    vi.useRealTimers();
  });

  it('dedupes concurrent callers onto one in-flight promise', async () => {
    let starts = 0;
    const fn = vi.fn(async () => {
      starts += 1;
      await Promise.resolve();
      return starts;
    });

    const [a, b, c] = await Promise.all([
      sharedRead('k', fn),
      sharedRead('k', fn),
      sharedRead('k', fn),
    ]);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(a).toBe(1);
    expect(b).toBe(1);
    expect(c).toBe(1);
  });

  it('reuses a successful result within the TTL', async () => {
    vi.useFakeTimers();
    const fn = vi.fn(async () => 'ok');

    await expect(sharedRead('k', fn, 1_000)).resolves.toBe('ok');
    await expect(sharedRead('k', fn, 1_000)).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1_001);
    await expect(sharedRead('k', fn, 1_000)).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not cache failures; the next caller retries', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce('recovered');

    await expect(sharedRead('k', fn)).rejects.toThrow('boom');
    await expect(sharedRead('k', fn)).resolves.toBe('recovered');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('invalidateSharedReads clears by prefix', async () => {
    const a = vi.fn(async () => 1);
    const b = vi.fn(async () => 2);

    await sharedRead('student-enrollments:open', a);
    await sharedRead('original-lessons:catalog', b);
    invalidateSharedReads('student-enrollments:');

    await sharedRead('student-enrollments:open', a);
    await sharedRead('original-lessons:catalog', b);

    expect(a).toHaveBeenCalledTimes(2);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('uses the default TTL constant', () => {
    expect(SHARED_READ_DEFAULT_TTL_MS).toBe(3_000);
  });
});
