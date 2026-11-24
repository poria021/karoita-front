import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { NestSemester } from '@/types/nest-admin';

const loadAllSemesters = vi.fn();
const fetchListPage = vi.fn();

vi.mock('./useCurrentTerms', () => ({
  loadAllSemesters: () => loadAllSemesters(),
}));
vi.mock('@/services/reports/real/list-reports.api', () => ({
  fetchListPage: (...args: unknown[]) => fetchListPage(...args),
}));

function semester(id: string, patch: Partial<NestSemester> = {}): NestSemester {
  return { id, season: 'one', structure: 'semester', ...patch } as NestSemester;
}

async function load() {
  // کش ۳۰ ثانیه‌ای ماژول بین تست‌ها نشت نکند.
  vi.resetModules();
  return import('./openSemesters');
}

describe('loadListRowsForOpenSemesters', () => {
  beforeEach(() => {
    loadAllSemesters.mockReset();
    fetchListPage.mockReset();
  });

  it('همهٔ نیم‌سال‌ها بسته‌اند → ردیفی نیست و درخواستی نمی‌رود', async () => {
    loadAllSemesters.mockResolvedValue([
      semester('s1', { startClasses: false, courseSelection: false }),
      semester('s2', { startClasses: false, courseSelection: false }),
    ]);
    const { loadListRowsForOpenSemesters } = await load();

    const result = await loadListRowsForOpenSemesters('schools');

    expect(result.rows).toEqual([]);
    expect(fetchListPage).not.toHaveBeenCalled();
  });

  it('فقط با semesterId نیم‌سال باز درخواست می‌زند (نه همهٔ نیم‌سال‌ها)', async () => {
    loadAllSemesters.mockResolvedValue([
      semester('old', { startClasses: false, courseSelection: false }),
      semester('now', { startClasses: true, courseSelection: false }),
    ]);
    fetchListPage.mockResolvedValue({ rows: [{ id: 'a' }], hasNextPage: false });
    const { loadListRowsForOpenSemesters } = await load();

    const result = await loadListRowsForOpenSemesters('schools');

    expect(fetchListPage).toHaveBeenCalledTimes(1);
    expect(fetchListPage.mock.calls[0]![1].period).toMatchObject({
      mode: 'term',
      semesterId: 'now',
    });
    expect(result.rows.map((row) => row.id)).toEqual(['a']);
  });

  it('همهٔ صفحه‌های نیم‌سال باز را می‌گیرد', async () => {
    loadAllSemesters.mockResolvedValue([semester('now', { startClasses: true })]);
    fetchListPage
      .mockResolvedValueOnce({ rows: [{ id: 'a' }], hasNextPage: true })
      .mockResolvedValueOnce({ rows: [{ id: 'b' }], hasNextPage: false });
    const { loadListRowsForOpenSemesters } = await load();

    const result = await loadListRowsForOpenSemesters('schools');

    expect(fetchListPage).toHaveBeenCalledTimes(2);
    expect(result.rows.map((row) => row.id)).toEqual(['a', 'b']);
  });
});
