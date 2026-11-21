import { describe, expect, it, vi, beforeEach } from 'vitest';

import { loadFacultyPerformanceRows } from './facultyPerformanceQuery';

const fetchListPage = vi.fn();

vi.mock('@/services/reports/real/list-reports.api', () => ({
  fetchListPage: (...args: unknown[]) => fetchListPage(...args),
}));

describe('loadFacultyPerformanceRows', () => {
  beforeEach(() => {
    fetchListPage.mockReset();
  });

  it('fetches all pages once for a performance slug', async () => {
    fetchListPage
      .mockResolvedValueOnce({
        rows: [{ id: 'a' }, { id: 'b' }],
        hasNextPage: true,
      })
      .mockResolvedValueOnce({
        rows: [{ id: 'c' }],
        hasNextPage: false,
      });

    const result = await loadFacultyPerformanceRows('faculty-performance');

    expect(fetchListPage).toHaveBeenCalledTimes(2);
    expect(fetchListPage).toHaveBeenNthCalledWith(1, 'faculty-performance', {
      filters: {},
      query: '',
      period: { mode: 'term', termId: '', moduleId: '' },
      page: 1,
    });
    expect(result.rows.map((row) => row.id)).toEqual(['a', 'b', 'c']);
    expect(result.truncated).toBe(false);
  });
});
