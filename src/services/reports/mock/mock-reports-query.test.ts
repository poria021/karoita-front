import { describe, expect, it } from 'vitest';

import { CUR_PERIOD } from '@/features/karvita/reports/constants';
import { queryReport } from '@/services/reports/mock/mock-reports-query';
import type { ReportPeriodState } from '@/types/reports';

const defaultPeriod: ReportPeriodState = {
  mode: 'term',
  termId: CUR_PERIOD.term,
  moduleId: CUR_PERIOD.module,
};

describe('mock-reports-query', () => {
  it('returns learner rows for default query', () => {
    const result = queryReport({
      slug: 'learners',
      filters: {},
      query: '',
      period: defaultPeriod,
      sort: null,
      page: 1,
    });
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);
  });

  it('narrows learners when filtering by province', () => {
    const all = queryReport({
      slug: 'learners',
      filters: {},
      query: '',
      period: defaultPeriod,
      sort: null,
      page: 1,
    });
    const tehran = queryReport({
      slug: 'learners',
      filters: { province: 'p0' },
      query: '',
      period: defaultPeriod,
      sort: null,
      page: 1,
    });
    expect(tehran.total).toBeLessThan(all.total);
    expect(tehran.total).toBeGreaterThan(0);
    expect(
      tehran.rows.every((r) => r.province === 'p0' || r.province === undefined)
    ).toBe(true);
  });

  it('paginates with correct total', () => {
    const page1 = queryReport({
      slug: 'learners',
      filters: {},
      query: '',
      period: defaultPeriod,
      sort: null,
      page: 1,
      pageSize: 10,
    });
    const full = queryReport({
      slug: 'learners',
      filters: {},
      query: '',
      period: defaultPeriod,
      sort: null,
      page: 1,
      pageSize: 1000,
    });
    expect(page1.rows.length).toBeLessThanOrEqual(10);
    expect(page1.total).toBe(full.total);
  });
});
