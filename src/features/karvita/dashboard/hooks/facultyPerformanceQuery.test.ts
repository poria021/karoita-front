import { beforeEach, describe, expect, it, vi } from 'vitest';

import { loadFacultyPerformanceRows } from './facultyPerformanceQuery';

const loadListRowsForOpenSemesters = vi.fn();

vi.mock('./openSemesters', () => ({
  loadListRowsForOpenSemesters: (...args: unknown[]) =>
    loadListRowsForOpenSemesters(...args),
}));

describe('loadFacultyPerformanceRows', () => {
  beforeEach(() => {
    loadListRowsForOpenSemesters.mockReset();
  });

  it('reads the rows of the open semesters for a performance slug', async () => {
    loadListRowsForOpenSemesters.mockResolvedValue({
      rows: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      truncated: false,
    });

    const result = await loadFacultyPerformanceRows('faculty-performance');

    expect(loadListRowsForOpenSemesters).toHaveBeenCalledTimes(1);
    expect(loadListRowsForOpenSemesters).toHaveBeenCalledWith(
      'faculty-performance'
    );
    expect(result.rows.map((row) => row.id)).toEqual(['a', 'b', 'c']);
    expect(result.truncated).toBe(false);
  });

  it('returns no rows when no semester is open', async () => {
    loadListRowsForOpenSemesters.mockResolvedValue({
      rows: [],
      truncated: false,
    });
    const result = await loadFacultyPerformanceRows('faculty-performance');
    expect(result.rows).toEqual([]);
  });
});
