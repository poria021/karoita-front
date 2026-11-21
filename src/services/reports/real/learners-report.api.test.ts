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
  fetchLearnersFilterBox,
  fetchLearnersPage,
  learnersDescendantKeys,
  mapLearnerRow,
} from '@/services/reports/real/learners-report.api';
import type { ReportPeriodState } from '@/types/reports';

const PERIOD: ReportPeriodState = { mode: 'term', termId: 't0', moduleId: 'm1' };

function searchParamsOf(callIndex = 0): Record<string, string | number> {
  return getJson.mock.calls[callIndex]![2].searchParams;
}

describe('learners report API', () => {
  beforeEach(() => {
    getJson.mockReset();
  });

  it('عوض‌کردن استان همهٔ باکس‌های بعدی را پاک می‌کند', () => {
    expect(learnersDescendantKeys('province').sort()).toEqual(
      ['city', 'faculty', 'professor', 'region', 'school', 'teacher'].sort()
    );
  });

  it('دانشکده به مدرسه وصل نیست ولی مدرسه و استاد (و معلم از راه مدرسه) را پاک می‌کند', () => {
    const cleared = learnersDescendantKeys('faculty');
    expect(cleared).toEqual(expect.arrayContaining(['school', 'professor', 'teacher']));
    expect(learnersDescendantKeys('school')).toEqual(['teacher']);
    expect(learnersDescendantKeys('teacher')).toEqual([]);
  });

  it('باکس شهر با provinceId و کلید cities خوانده می‌شود', async () => {
    getJson.mockResolvedValue({ cities: [{ id: 'c1', title: 'شیراز' }] });
    const box = await fetchLearnersFilterBox('city', { province: 'p1' }, PERIOD);
    expect(getJson.mock.calls[0]![0]).toBe('v1/reports/filters/learners_list');
    expect(searchParamsOf()).toEqual({ structure: 'semester', field: 'city', provinceId: 'p1' });
    expect(box).toEqual({
      status: 'ok',
      options: [{ value: 'c1', label: 'شیراز' }],
    });
  });

  it('منطقه و دانشکده با نام‌های Nest صدا زده می‌شوند', async () => {
    getJson.mockResolvedValue({ educationalDistricts: [] });
    await fetchLearnersFilterBox('region', { province: 'p1', city: 'c1' }, PERIOD);
    expect(searchParamsOf()).toEqual({
      structure: 'semester',
      field: 'educationalDistrict',
      provinceId: 'p1',
      cityId: 'c1',
    });
    getJson.mockResolvedValue({ universities: [] });
    await fetchLearnersFilterBox('faculty', { province: 'p1' }, PERIOD);
    expect(searchParamsOf(1)).toEqual({ structure: 'semester', field: 'university', provinceId: 'p1' });
  });

  it('استاد با fullName و معلم با کلید teachers خوانده می‌شود', async () => {
    getJson.mockResolvedValue({ professors: [{ id: 'u1', fullName: 'علی رضایی' }] });
    const box = await fetchLearnersFilterBox('professor', {}, PERIOD);
    expect(box).toEqual({
      status: 'ok',
      options: [{ value: 'u1', label: 'علی رضایی' }],
    });
  });

  it('دوره فقط وقتی semesterId واقعی هست فرستاده می‌شود', async () => {
    getJson.mockResolvedValue({ schools: [] });
    await fetchLearnersFilterBox('school', {}, PERIOD);
    expect(searchParamsOf()).toEqual({ structure: 'semester', field: 'school' });

    await fetchLearnersFilterBox(
      'school',
      { professor: 'u1' },
      { ...PERIOD, semesterId: 's1' }
    );
    expect(searchParamsOf(1)).toEqual({
      field: 'school',
      professorId: 'u1',
      structure: 'semester',
      semesterId: 's1',
    });
  });

  it('کلید غایب یا ۴۰۳ یعنی باکس برای نقش نیست؛ ۴۰۰ یعنی تعارض', async () => {
    getJson.mockResolvedValueOnce({ provinces: [] });
    expect(await fetchLearnersFilterBox('city', {}, PERIOD)).toEqual({
      status: 'absent',
    });
    getJson.mockRejectedValueOnce(new ApiClientError('ممنوع', 403));
    expect(await fetchLearnersFilterBox('teacher', {}, PERIOD)).toEqual({
      status: 'absent',
    });
    getJson.mockRejectedValueOnce(new ApiClientError('ناسازگار', 400));
    expect(await fetchLearnersFilterBox('school', {}, PERIOD)).toEqual({
      status: 'conflict',
      message: 'ناسازگار',
    });
    getJson.mockRejectedValueOnce(new ApiClientError('خطا', 500));
    await expect(fetchLearnersFilterBox('school', {}, PERIOD)).rejects.toThrow();
  });

  it('جدول idها را با نام‌های Nest می‌فرستد و «همه» را نمی‌فرستد', async () => {
    getJson.mockResolvedValue({ data: [{ id: 'l1', fullName: 'سارا' }], hasNextPage: true });
    const result = await fetchLearnersPage({
      filters: { province: 'p1', faculty: 'u1', school: '' },
      query: ' سارا ',
      period: PERIOD,
      page: 2,
      limit: 5000,
    });
    expect(getJson.mock.calls[0]![0]).toBe('v1/reports/learners');
    expect(searchParamsOf()).toEqual({
      structure: 'semester',
      provinceId: 'p1',
      universityId: 'u1',
      search: 'سارا',
      page: 2,
      limit: 20,
    });
    expect(result.hasNextPage).toBe(true);
    expect(result.rows[0]).toMatchObject({ id: 'l1', name: 'سارا' });
  });

  it('نگاشت ردیف چند نام محتمل را می‌پذیرد', () => {
    expect(
      mapLearnerRow(
        {
          _id: 'x',
          firstName: 'علی',
          lastName: 'رضایی',
          mobile: '0912',
          province: { title: 'فارس' },
          courses: [{ title: 'کارورزی ۱' }, 'کارورزی ۲'],
        },
        0
      )
    ).toMatchObject({
      id: 'x',
      name: 'علی رضایی',
      phone: '0912',
      provName: 'فارس',
      courses: ['کارورزی ۱', 'کارورزی ۲'],
    });
  });
});
