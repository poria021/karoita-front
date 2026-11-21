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

const PERIOD: ReportPeriodState = { mode: 'term', termId: '', moduleId: '' };

function searchParamsOf(callIndex = 0): Record<string, string | number> {
  return getJson.mock.calls[callIndex]![2].searchParams;
}

describe('جستجوی داخل باکس فیلتر (field + search)', () => {
  beforeEach(() => {
    getJson.mockReset();
  });

  it('لیست فراگیران: فقط باکس استان با search گرفته می‌شود', async () => {
    getJson.mockResolvedValue({ provinces: [{ id: 'p1', title: 'تهران' }] });
    const box = await ReportsService.getReportFilterBox(
      'learners',
      'province',
      {},
      PERIOD,
      'تهران'
    );
    expect(getJson.mock.calls[0]![0]).toBe('v1/reports/filters/learners_list');
    expect(searchParamsOf()).toEqual({ structure: 'semester', field: 'province', search: 'تهران' });
    expect(box).toEqual({
      status: 'ok',
      options: [{ value: 'p1', label: 'تهران' }],
    });
  });

  it('سرچ شهر والد (provinceId) را نگه می‌دارد', async () => {
    getJson.mockResolvedValue({ cities: [] });
    await ReportsService.getReportFilterBox(
      'learners',
      'city',
      { province: 'P1' },
      PERIOD,
      'ری'
    );
    expect(searchParamsOf()).toEqual({
      structure: 'semester',
      field: 'city',
      provinceId: 'P1',
      search: 'ری',
    });
  });

  it('حضور و غیاب فراگیران و گزارش‌های لیستی هم search را می‌فرستند', async () => {
    getJson.mockResolvedValue({ cities: [] });
    await ReportsService.getReportFilterBox(
      'attendance',
      'city',
      {},
      PERIOD,
      'ری'
    );
    expect(getJson.mock.calls[0]![0]).toBe(
      'v1/reports/filters/learners_attendance'
    );
    expect(searchParamsOf()).toEqual({ structure: 'semester', field: 'city', search: 'ری' });

    await ReportsService.getReportFilterBox('schools', 'city', {}, PERIOD, 'ری');
    expect(getJson.mock.calls[1]![0]).toBe('v1/reports/filters/schools_list');
    expect(searchParamsOf(1)).toEqual({ structure: 'semester', field: 'city', search: 'ری' });
  });

  it('بدون متن، search فرستاده نمی‌شود', async () => {
    getJson.mockResolvedValue({ provinces: [] });
    await ReportsService.getReportFilterBox('learners', 'province', {}, PERIOD);
    expect(searchParamsOf()).toEqual({ structure: 'semester', field: 'province' });
  });
});
