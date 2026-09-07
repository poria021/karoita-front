import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isChunkLoadError, tryReloadForChunkError } from '@/lib/chunk-error';

// ─── isChunkLoadError ────────────────────────────────────────────────────────

describe('isChunkLoadError', () => {
  it('returns true for ChunkLoadError name', () => {
    const err = Object.assign(new Error('Loading chunk 7107 failed.'), {
      name: 'ChunkLoadError',
    });
    expect(isChunkLoadError(err)).toBe(true);
  });

  it('returns true for "Loading chunk" message', () => {
    expect(isChunkLoadError(new Error('Loading chunk 42 failed.'))).toBe(true);
  });

  it('returns true for dynamic import failure message', () => {
    expect(
      isChunkLoadError(new Error('Failed to fetch dynamically imported module'))
    ).toBe(true);
  });

  it('returns true for Safari dynamic import message', () => {
    expect(
      isChunkLoadError(new Error('Importing a module script failed'))
    ).toBe(true);
  });

  it('returns false for a generic Error', () => {
    expect(isChunkLoadError(new Error('Something went wrong'))).toBe(false);
  });

  it('returns false for non-Error values', () => {
    expect(isChunkLoadError('string error')).toBe(false);
    expect(isChunkLoadError(null)).toBe(false);
    expect(isChunkLoadError(undefined)).toBe(false);
    expect(isChunkLoadError(42)).toBe(false);
  });
});

// ─── tryReloadForChunkError ──────────────────────────────────────────────────

describe('tryReloadForChunkError', () => {
  const STORAGE_KEY = 'kv_chunk_reload_at';

  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal('location', { reload: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls reload and returns true on first invocation', () => {
    const result = tryReloadForChunkError();

    expect(result).toBe(true);
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });

  it('stores timestamp in sessionStorage after reload', () => {
    const before = Date.now();
    tryReloadForChunkError();
    const stored = Number(sessionStorage.getItem(STORAGE_KEY));

    expect(stored).toBeGreaterThanOrEqual(before);
    expect(stored).toBeLessThanOrEqual(Date.now());
  });

  it('returns false and skips reload within cooldown window', () => {
    sessionStorage.setItem(STORAGE_KEY, String(Date.now()));

    const result = tryReloadForChunkError();

    expect(result).toBe(false);
    expect(window.location.reload).not.toHaveBeenCalled();
  });

  it('reloads again after cooldown has elapsed', () => {
    const expired = Date.now() - 20_000; // 20 s ago — past 15 s cooldown
    sessionStorage.setItem(STORAGE_KEY, String(expired));

    const result = tryReloadForChunkError();

    expect(result).toBe(true);
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });

  it('still reloads when sessionStorage throws (private mode)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    const result = tryReloadForChunkError();

    expect(result).toBe(true);
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });
});
