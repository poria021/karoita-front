import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ActiveCourseDefinitions } from '@/hooks/useActiveCourseDefinitions';

const catalogState = vi.hoisted(() => ({
  mockApi: false,
  definitions: {
    status: 'ready',
    semester: [],
    modular: [],
  } as ActiveCourseDefinitions,
}));

vi.mock('@/lib/api-mode', () => ({
  isMockApiMode: () => catalogState.mockApi,
}));

vi.mock('@/hooks/useActiveCourseDefinitions', () => ({
  useActiveCourseDefinitions: (_enabled?: boolean) => catalogState.definitions,
}));

import { useShellCatalogReady } from './useShellCatalogReady';

function renderReady() {
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(
      QueryClientProvider,
      {
        client: new QueryClient({
          defaultOptions: { queries: { retry: false } },
        }),
      },
      children
    );
  return renderHook(() => useShellCatalogReady(), { wrapper });
}

describe('useShellCatalogReady', () => {
  afterEach(() => {
    catalogState.mockApi = false;
    catalogState.definitions = {
      status: 'ready',
      semester: [],
      modular: [],
    };
  });

  it('is ready immediately in mock mode', () => {
    catalogState.mockApi = true;
    catalogState.definitions = {
      status: 'loading',
      semester: [],
      modular: [],
    };

    const { result, unmount } = renderReady();
    expect(result.current).toBe(true);
    unmount();
  });

  it('waits while the real catalog is loading for any role', () => {
    catalogState.mockApi = false;
    catalogState.definitions = {
      status: 'loading',
      semester: [],
      modular: [],
    };

    const { result, unmount } = renderReady();
    expect(result.current).toBe(false);
    unmount();
  });

  it('is ready when the real catalog resolves', () => {
    catalogState.mockApi = false;
    catalogState.definitions = {
      status: 'ready',
      semester: [],
      modular: [],
    };

    const { result, unmount } = renderReady();
    expect(result.current).toBe(true);
    unmount();
  });

  it('is ready when the real catalog request fails', () => {
    catalogState.mockApi = false;
    catalogState.definitions = {
      status: 'error',
      semester: [],
      modular: [],
    };

    const { result, unmount } = renderReady();
    expect(result.current).toBe(true);
    unmount();
  });
});
