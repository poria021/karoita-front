import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSyncedUrlParam } from '@/hooks/useSyncedUrlParam';
import { resetShallowLocationForTests } from '@/lib/shallow-location';

vi.mock('next/navigation', () => ({
  usePathname: () => '/karvita/admin/organizational-structure',
}));

const TABS = ['provinces', 'cities', 'districts'] as const;

describe('useSyncedUrlParam', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/karvita/admin/organizational-structure');
  });

  afterEach(() => {
    resetShallowLocationForTests();
    window.history.replaceState(null, '', '/');
  });

  it('mirrors the default tab into the URL without growing history', async () => {
    const lengthBefore = window.history.length;
    const { result } = renderHook(() =>
      useSyncedUrlParam({
        name: 'tab',
        allowed: TABS,
        defaultValue: 'provinces',
      })
    );

    expect(result.current[0]).toBe('provinces');

    await waitFor(() => {
      expect(window.location.search).toBe('?tab=provinces');
    });
    expect(window.history.length).toBe(lengthBefore);
  });

  it('reads an allowlisted tab from the current search string', () => {
    window.history.replaceState(
      null,
      '',
      '/karvita/admin/organizational-structure?tab=cities'
    );

    const { result } = renderHook(() =>
      useSyncedUrlParam({
        name: 'tab',
        allowed: TABS,
        defaultValue: 'provinces',
      })
    );

    expect(result.current[0]).toBe('cities');
  });

  it('setValue updates search in place', async () => {
    const { result } = renderHook(() =>
      useSyncedUrlParam({
        name: 'tab',
        allowed: TABS,
        defaultValue: 'provinces',
      })
    );

    await waitFor(() => {
      expect(window.location.search).toBe('?tab=provinces');
    });

    act(() => {
      result.current[1]('districts');
    });

    await waitFor(() => {
      expect(result.current[0]).toBe('districts');
      expect(window.location.search).toBe('?tab=districts');
    });
  });
});
