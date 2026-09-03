import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  readLocalFormDraftState,
  useLocalFormDraft,
  writeLocalFormDraftState,
} from './useLocalFormDraft';

describe('useLocalFormDraft', () => {
  const STORAGE_PREFIX = 'karvita:draft:';

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('writes and reads a draft successfully', () => {
    const { result } = renderHook(() =>
      useLocalFormDraft<{ text: string; files: Array<{ id: string; name: string; sizeMb: number; mimeType?: string }> }>({
        key: 'weekly-report:week-1',
        initialValue: { text: '', files: [] },
        debounceMs: 0,
      })
    );

    act(() => {
      result.current.setValue({
        text: 'hello draft',
        files: [{ id: 'a', name: 'x.txt', sizeMb: 1.2, mimeType: 'text/plain' }],
      });
      vi.runAllTimers();
    });

    expect(localStorage.getItem(`${STORAGE_PREFIX}weekly-report:week-1`)).toContain('hello draft');
    expect(result.current.hasDraft).toBe(true);
    expect(result.current.value.text).toBe('hello draft');
  });

  it('treats expired drafts as invalid and removes them', () => {
    const key = `${STORAGE_PREFIX}weekly-report:week-2`;
    localStorage.setItem(
      key,
      JSON.stringify({
        value: { text: 'old', files: [] },
        savedAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
      })
    );

    const { result } = renderHook(() =>
      useLocalFormDraft({ key: 'weekly-report:week-2', initialValue: { text: '', files: [] } })
    );

    expect(result.current.hasDraft).toBe(false);
    expect(result.current.value).toEqual({ text: '', files: [] });
    expect(localStorage.getItem(key)).toBeNull();
  });

  it('ignores malformed stored draft payloads', () => {
    const key = `${STORAGE_PREFIX}weekly-report:week-3`;
    localStorage.setItem(key, '{not valid json');

    const { result } = renderHook(() =>
      useLocalFormDraft({ key: 'weekly-report:week-3', initialValue: { text: '', files: [] } })
    );

    expect(result.current.hasDraft).toBe(false);
    expect(localStorage.getItem(key)).toBeNull();
  });

  it('clears the draft and removes it from storage', () => {
    const { result } = renderHook(() =>
      useLocalFormDraft({ key: 'weekly-report:week-4', initialValue: { text: '', files: [] }, debounceMs: 0 })
    );

    act(() => {
      result.current.setValue({ text: 'saved', files: [] });
    });

    act(() => {
      result.current.clearDraft();
    });

    expect(result.current.hasDraft).toBe(false);
    expect(localStorage.getItem(`${STORAGE_PREFIX}weekly-report:week-4`)).toBeNull();
  });

  it('is safe in no-window scenarios', () => {
    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      configurable: true,
    });

    try {
      const read = readLocalFormDraftState<{ text: string; files: unknown[] }>(
        'weekly-report:week-5',
        7 * 24 * 60 * 60 * 1000
      );
      expect(read).toEqual({ value: null, hasDraft: false });

      writeLocalFormDraftState('weekly-report:week-5', { text: 'no-window', files: [] });
      const afterWrite = readLocalFormDraftState<{ text: string; files: unknown[] }>(
        'weekly-report:week-5',
        7 * 24 * 60 * 60 * 1000
      );
      expect(afterWrite).toEqual({ value: null, hasDraft: false });
    } finally {
      Object.defineProperty(globalThis, 'window', {
        value: originalWindow,
        configurable: true,
      });
    }
  });
});
