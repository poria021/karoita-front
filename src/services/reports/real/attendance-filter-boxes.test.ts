import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getJson } = vi.hoisted(() => ({ getJson: vi.fn() }));

vi.mock('@/services/api-client', async () => {
  const { ApiClientError } = await import('@/services/api-error');
  return {
    ApiClientError,
    apiClient: { getJson, baseUrl: 'http://localhost/api/nest' },
  };
});

import { ApiClientError } from '@/services/api-error';
import {
  fetchLearnersFilterBoxes,
  NEST_LEARNERS_ATTENDANCE_PATHS,
} from '@/services/reports/real/learners-report.api';
import { fetchListFilterBoxes } from '@/services/reports/real/list-reports.api';
import type { ReportPeriodState } from '@/types/reports';

const PERIOD: ReportPeriodState = {
  mode: 'term',
  termId: 't0',
  moduleId: 'm1',
  semesterId: 'sem-1',
};

describe('یک درخواست برای همهٔ باکس‌ها (بدون field)', () => {
  beforeEach(() => getJson.mockReset());

  it('فراگیران: field نمی‌فرستد و فقط کلیدهای آمده را نشان می‌دهد', async () => {
    getJson.mockResolvedValue({
      provinces: [{ id: 'p1', title: 'قم' }],
      teachers: [{ id: 't1', fullName: 'معلم' }],
    });
    const boxes = await fetchLearnersFilterBoxes(
      { province: 'p1', city: '' },
      PERIOD,
      NEST_LEARNERS_ATTENDANCE_PATHS
    );
    const [path, , opts] = getJson.mock.calls[0]!;
    expect(path).toBe('v1/reports/filters/learners_attendance');
    expect(opts.searchParams).toEqual({
      provinceId: 'p1',
      structure: 'semester',
      semesterId: 'sem-1',
    });
    expect(boxes.province).toEqual({
      status: 'ok',
      options: [{ value: 'p1', label: 'قم' }],
    });
    expect(boxes.teacher?.status).toBe('ok');
    expect(boxes.city).toEqual({ status: 'absent' });
    expect(boxes.faculty).toEqual({ status: 'absent' });
  });

  it('پاسخ خالی یعنی همهٔ باکس‌ها مخفی', async () => {
    getJson.mockResolvedValue({});
    const boxes = await fetchLearnersFilterBoxes({}, PERIOD);
    expect(Object.values(boxes).every((b) => b?.status === 'absent')).toBe(true);
  });

  it('۴۰۰ تعارض است', async () => {
    getJson.mockRejectedValueOnce(new ApiClientError('خارج از محدوده', 400));
    const boxes = await fetchLearnersFilterBoxes({ province: 'x' }, PERIOD);
    expect(boxes.province?.status).toBe('conflict');
  });

  it('حضور اساتید: فقط استان/شهر/دانشکده و idهای دیگر نمی‌رود', async () => {
    getJson.mockResolvedValue({ provinces: [{ id: 'p1', title: 'قم' }] });
    const boxes = await fetchListFilterBoxes(
      'professor-attendance',
      { province: 'p1', school: 's1', region: 'd1' },
      PERIOD
    );
    expect(getJson.mock.calls[0]![0]).toBe(
      'v1/reports/filters/professors_attendance'
    );
    expect(getJson.mock.calls[0]![2].searchParams).toEqual({
      provinceId: 'p1',
      structure: 'semester',
      semesterId: 'sem-1',
    });
    expect(Object.keys(boxes).sort()).toEqual(['city', 'faculty', 'province']);
    expect(boxes.province?.status).toBe('ok');
    expect(boxes.city).toEqual({ status: 'absent' });
  });
});
