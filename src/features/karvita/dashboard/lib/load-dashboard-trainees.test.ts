import { beforeEach, describe, expect, it, vi } from 'vitest';

const loadOpenSemesters = vi.fn();
const listPage = vi.fn();
const listTerms = vi.fn();

vi.mock('@/lib/api-mode', () => ({ isMockApiMode: () => false }));
vi.mock('../hooks/openSemesters', () => ({
  loadOpenSemesters: () => loadOpenSemesters(),
}));
vi.mock('@/services/daily-approvals.service', () => ({
  DAILY_APPROVALS_PAGE_SIZE: 20,
  DailyApprovalsService: {
    listTerms: (...args: unknown[]) => listTerms(...args),
    listPage: (...args: unknown[]) => listPage(...args),
  },
}));

import { loadDashboardTrainees } from './load-dashboard-trainees';

describe('loadDashboardTrainees', () => {
  beforeEach(() => {
    loadOpenSemesters.mockReset();
    listPage.mockReset();
    listTerms.mockReset();
  });

  it('نیم‌سال بازی نیست → فراگیری خوانده نمی‌شود (نه اولین ترم فهرست)', async () => {
    loadOpenSemesters.mockResolvedValue([]);

    const result = await loadDashboardTrainees();

    expect(result.trainees).toEqual([]);
    expect(listPage).not.toHaveBeenCalled();
    expect(listTerms).not.toHaveBeenCalled();
  });

  it('فقط ترم باز هر مسیر را می‌خواند', async () => {
    loadOpenSemesters.mockResolvedValue([
      { kind: 'semester', semester: { id: 'term-now' } },
    ]);
    listPage.mockResolvedValue({
      items: [{ id: 't1' }],
      hasMore: false,
    });

    const result = await loadDashboardTrainees();

    expect(listPage).toHaveBeenCalledTimes(1);
    expect(listPage.mock.calls[0]![0]).toMatchObject({
      kind: 'internship',
      termId: 'term-now',
    });
    expect(result.trainees).toHaveLength(1);
  });
});
