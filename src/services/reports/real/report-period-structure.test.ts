import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getJson } = vi.hoisted(() => ({ getJson: vi.fn() }));

vi.mock('@/services/api-client', async () => {
  const { ApiClientError } = await import('@/services/api-error');
  return {
    ApiClientError,
    apiClient: { getJson, baseUrl: 'http://localhost/api/nest' },
  };
});

import { ReportsService } from '@/services/reports.service';
import type { ReportPeriodState } from '@/types/reports';

const TERM: ReportPeriodState = { mode: 'term', termId: '', moduleId: '' };
const MODULE: ReportPeriodState = { mode: 'module', termId: '', moduleId: '' };

function params(): Record<string, string | number> {
  return getJson.mock.calls.at(-1)![2].searchParams;
}

describe('فیلتر ترمی/پودمانی روی همهٔ گزارش‌ها', () => {
  beforeEach(() => {
    getJson.mockReset();
    getJson.mockResolvedValue({ data: [], hasNextPage: false });
  });

  it.each(['learners', 'scores', 'attendance', 'schools', 'teacher-performance'] as const)(
    '%s: بدون انتخاب دوره هم structure مطابق نظام فرستاده می‌شود',
    async (slug) => {
      const base = { slug, filters: {}, query: '', sort: null, page: 1, pageSize: 20 };
      await ReportsService.queryReport({ ...base, period: TERM });
      expect(params().structure).toBe('semester');
      expect(params().semesterId).toBeUndefined();

      await ReportsService.queryReport({ ...base, period: MODULE });
      expect(params().structure).toBe('podmani');
      expect(params().semesterId).toBeUndefined();

      await ReportsService.queryReport({
        ...base,
        period: { ...MODULE, semesterId: 's1' },
      });
      expect(params()).toMatchObject({ structure: 'podmani', semesterId: 's1' });
    }
  );
});
