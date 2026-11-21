import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { nav, ROWS } = vi.hoisted(() => ({
  nav: { pathname: '/karvita/reports/attendance' },
  ROWS: [
    { id: 'a1', name: 'اول' },
    { id: 'a2', name: 'دوم' },
    { id: 'a3', name: 'سوم' },
  ],
}));

vi.mock('next/navigation', () => ({
  usePathname: () => nav.pathname,
}));

vi.mock('sonner', () => ({
  toast: Object.assign(() => 'toast-id', {
    error: () => 'toast-error',
    success: () => 'toast-success',
    message: () => 'toast-message',
    promise: () => 'toast-promise',
  }),
}));

vi.mock('@/services/reports.service', () => ({
  isRealApiReport: () => false,
  isRealLearnersReport: () => false,
  isRealScoresReport: () => false,
  sortLoadedRows: (rows: unknown[]) => rows,
  ReportsService: {
    getColumnDefs: () => [],
    queryReport: async () => ({
      rows: ROWS,
      columns: [],
      total: ROWS.length,
      hasNextPage: false,
      page: 1,
    }),
  },
}));

vi.mock('@/services/reports/real/learners-report.api', () => ({
  learnersDescendantKeys: () => [],
  withRowStatusFallback: (detail: unknown) => detail,
}));

vi.mock('@/services/reports/real/report-periods.api', () => ({
  fetchReportPeriods: async () => [],
}));

vi.mock('@/services/reports/real/list-reports.api', () => ({
  isListReportSlug: () => false,
  listReportDescendantKeys: () => [],
}));

import { resetShallowLocationForTests } from '@/lib/shallow-location';
import type { ReportSlug } from '@/types/report-access';

import { useAdminReportPage } from './useAdminReportPage';

const OPTIONS = { canCompare: true } as const;

function pathFor(slug: string): string {
  return `/karvita/reports/${slug}`;
}

function renderReport(slug: ReportSlug) {
  return renderHook(
    ({ current }: { current: ReportSlug }) =>
      useAdminReportPage(current, OPTIONS),
    { initialProps: { current: slug } }
  );
}

describe('useAdminReportPage — compare selection is scoped to one report', () => {
  beforeEach(() => {
    nav.pathname = pathFor('attendance');
    window.history.replaceState(null, '', pathFor('attendance'));
  });

  afterEach(() => {
    resetShallowLocationForTests();
  });

  it('keeps a ?view=compare&cmp deep link on first load', async () => {
    window.history.replaceState(
      null,
      '',
      `${pathFor('attendance')}?view=compare&cmp=a1,a2`
    );
    const { result } = renderReport('attendance');

    await waitFor(() => expect(result.current.rows).toHaveLength(3));
    expect(result.current.compareMode).toBe(true);
    expect(result.current.compareSelected).toEqual(['a1', 'a2']);
  });

  it('does not carry the old selection into a re-mounted report (Next.js re-mounts the page when [slug] changes)', async () => {
    window.history.replaceState(
      null,
      '',
      `${pathFor('attendance')}?view=compare&cmp=a1,a2`
    );
    const first = renderReport('attendance');
    await waitFor(() =>
      expect(first.result.current.compareSelected).toEqual(['a1', 'a2'])
    );
    first.unmount();

    // Next.js renders the new page first; window.location is still the old URL
    // (the history update lands afterwards).
    nav.pathname = pathFor('learners');
    const next = renderReport('learners');
    await act(async () => {
      window.history.replaceState(null, '', pathFor('learners'));
    });

    await waitFor(() => expect(next.result.current.rows).toHaveLength(3));
    expect(next.result.current.compareSelected).toEqual([]);
    expect(next.result.current.compareDraft).toEqual([]);
    expect(next.result.current.compareMode).toBe(false);
    expect(window.location.search).not.toContain('cmp');
  });

  it('does not carry the old selection when the same hook instance switches report', async () => {
    window.history.replaceState(
      null,
      '',
      `${pathFor('attendance')}?view=compare&cmp=a1,a2`
    );
    const { result, rerender } = renderReport('attendance');
    await waitFor(() =>
      expect(result.current.compareSelected).toEqual(['a1', 'a2'])
    );

    nav.pathname = pathFor('learners');
    rerender({ current: 'learners' });
    await act(async () => {
      window.history.replaceState(null, '', pathFor('learners'));
    });

    await waitFor(() => expect(result.current.rows).toHaveLength(3));
    expect(result.current.compareSelected).toEqual([]);
    expect(result.current.compareDraft).toEqual([]);
    expect(result.current.compareMode).toBe(false);
    expect(window.location.search).not.toContain('cmp');
  });

  it('resets selection mode and checked items when another report opens', async () => {
    const { result, rerender } = renderReport('attendance');
    await waitFor(() => expect(result.current.rows).toHaveLength(3));

    act(() => result.current.startCompareSelection());
    act(() => result.current.toggleCompareSelect('a1'));
    expect(result.current.compareSelecting).toBe(true);
    expect(result.current.compareSelected).toEqual(['a1']);

    nav.pathname = pathFor('learners');
    window.history.replaceState(null, '', pathFor('learners'));
    rerender({ current: 'learners' });

    await waitFor(() => expect(result.current.rows).toHaveLength(3));
    expect(result.current.compareSelecting).toBe(false);
    expect(result.current.compareSelected).toEqual([]);
  });

  it('drops a stray ?cmp left in the URL when the list page loads', async () => {
    window.history.replaceState(
      null,
      '',
      `${pathFor('attendance')}?cmp=a1,a2`
    );
    const { result } = renderReport('attendance');

    await waitFor(() => expect(result.current.rows).toHaveLength(3));
    expect(result.current.compareSelected).toEqual([]);
    await waitFor(() => expect(window.location.search).not.toContain('cmp'));
  });
});
