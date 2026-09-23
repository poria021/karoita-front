import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { toastMock } = vi.hoisted(() => {
  const toastFn = vi.fn(() => 'toast-id');
  return {
    toastMock: Object.assign(toastFn, {
      error: vi.fn(() => 'toast-error'),
      success: vi.fn(() => 'toast-success'),
      warning: vi.fn(() => 'toast-warning'),
    }),
  };
});

vi.mock('sonner', () => ({ toast: toastMock }));

vi.mock('next/navigation', () => ({
  usePathname: () => '/karvita/admin/organizational-structure',
}));

const listPageMock = vi.fn();
const upsertProvinceMock = vi.fn();

vi.mock('@/services/org-structure.service', () => ({
  ORG_STRUCTURE_PAGE_SIZE: 20,
  OrgStructureService: {
    listPage: (...args: unknown[]) => listPageMock(...args),
    listProvinces: vi.fn(async () => []),
    upsertProvince: (...args: unknown[]) => upsertProvinceMock(...args),
    flushListCache: vi.fn(),
    rememberRelationLabels: vi.fn(),
  },
}));

import { resetShallowLocationForTests } from '@/lib/shallow-location';
import { useDashboardModuleCache } from '@/store/useDashboardModuleCache';

import { useOrgStructurePage } from './useOrgStructurePage';

const EXISTING_PROVINCE = {
  id: 'p1',
  name: 'آذربایجان شرقی',
  kind: 'province' as const,
  deleteBlocked: false,
};

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

describe('useOrgStructurePage — scheduleCreate optimistic add', () => {
  beforeEach(() => {
    window.history.replaceState(
      null,
      '',
      '/karvita/admin/organizational-structure'
    );
    vi.clearAllMocks();
    useDashboardModuleCache.setState({ data: {}, chrome: {} });
    listPageMock.mockResolvedValue({
      items: [EXISTING_PROVINCE],
      total: 1,
      hasMore: false,
    });
  });

  afterEach(() => {
    resetShallowLocationForTests();
    window.history.replaceState(null, '', '/');
  });

  it('adds the new row to the table immediately, before the backend responds', async () => {
    let resolveUpsert: () => void = () => undefined;
    upsertProvinceMock.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveUpsert = resolve;
      })
    );

    const { result } = renderHook(() => useOrgStructurePage(), { wrapper });

    await waitFor(() => expect(result.current.items).toHaveLength(1));

    act(() => {
      result.current.scheduleCreate({ name: 'استان جدید' });
    });

    // ردیف optimistic باید همان لحظه در جدول باشد، قبل از پاسخ بکند
    // (upsertProvince هنوز حل نشده — resolveUpsert بعداً صدا زده می‌شود).
    await waitFor(() => expect(result.current.items).toHaveLength(2));
    expect(result.current.items[0]?.name).toBe('استان جدید');
    expect(result.current.total).toBe(2);
    expect(toastMock.error).not.toHaveBeenCalled();

    resolveUpsert();
    await waitFor(() => expect(listPageMock).toHaveBeenCalledTimes(2));
  });

  it('removes the row and shows an error toast when the backend rejects it', async () => {
    let rejectUpsert: (error: Error) => void = () => undefined;
    upsertProvinceMock.mockReturnValue(
      new Promise<void>((_resolve, reject) => {
        rejectUpsert = reject;
      })
    );

    const { result } = renderHook(() => useOrgStructurePage(), { wrapper });

    await waitFor(() => expect(result.current.items).toHaveLength(1));

    act(() => {
      result.current.scheduleCreate({ name: 'آذربایجان شرقی' });
    });

    // ردیف optimistic باید همان لحظه اضافه شود — قبل از رد شدن درخواست بکند.
    await waitFor(() => expect(result.current.items).toHaveLength(2));
    expect(result.current.total).toBe(2);

    act(() => {
      rejectUpsert(new Error('این نام قبلاً در سامانه ثبت شده است.'));
    });

    // پس از ناموفق بودن بکند، ردیف موقت باید حذف شود و toast خطا نمایش داده شود.
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(result.current.total).toBe(1);
    expect(toastMock.error).toHaveBeenCalledWith(
      'این نام قبلاً در سامانه ثبت شده است.'
    );
    // ردیف باقی‌مانده باید همان ردیف اصلی باشد، نه ردیف موقت.
    expect(result.current.items[0]?.id).toBe('p1');
  });
});
