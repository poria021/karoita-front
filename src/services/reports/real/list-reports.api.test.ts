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
  fetchListFilterBox,
  fetchListPage,
  isListReportFilterKey,
  isListReportSlug,
  listReportDescendantKeys,
  mapListRow,
} from '@/services/reports/real/list-reports.api';
import type { ReportPeriodState } from '@/types/reports';

const PERIOD: ReportPeriodState = { mode: 'term', termId: 't0', moduleId: 'm1' };

function searchParamsOf(callIndex = 0): Record<string, string | number> {
  return getJson.mock.calls[callIndex]![2].searchParams;
}

describe('list reports API (schools/faculties/provinces/teachers/principals/professors)', () => {
  beforeEach(() => {
    getJson.mockReset();
  });

  it('اسلاگ‌های لیستی را تشخیص می‌دهد و «فراگیران» را شامل نمی‌شود', () => {
    expect(isListReportSlug('schools')).toBe(true);
    expect(isListReportSlug('teachers')).toBe(true);
    expect(isListReportSlug('learners')).toBe(false);
    expect(isListReportSlug('attendance')).toBe(false);
  });

  it('سقف باکس هر گزارش طبق مستند است', () => {
    expect(isListReportFilterKey('schools', 'region')).toBe(true);
    expect(isListReportFilterKey('schools', 'faculty')).toBe(false);
    expect(isListReportFilterKey('faculties', 'city')).toBe(true);
    expect(isListReportFilterKey('faculties', 'region')).toBe(false);
    expect(isListReportFilterKey('provinces', 'province')).toBe(false);
    expect(isListReportFilterKey('teachers', 'school')).toBe(true);
    // teacher فقط برای school_district است اما سقف ساختاری گزارش شاملش می‌شود.
    expect(isListReportFilterKey('teachers', 'teacher')).toBe(true);
    expect(isListReportFilterKey('principals', 'school')).toBe(false);
    expect(isListReportFilterKey('professors', 'faculty')).toBe(true);
    expect(isListReportFilterKey('professors', 'region')).toBe(false);
  });

  it('مسیر فیلتر و جدول هر گزارش مطابق Swagger است', async () => {
    getJson.mockResolvedValue({ provinces: [] });
    await fetchListFilterBox('schools', 'province', {}, PERIOD);
    expect(getJson.mock.calls[0]![0]).toBe('v1/reports/filters/schools_list');

    getJson.mockResolvedValue({ data: [], hasNextPage: false });
    await fetchListPage('principals', { filters: {}, query: '', period: PERIOD, page: 1 });
    expect(getJson.mock.calls[1]![0]).toBe('v1/reports/school-admins');
  });

  it('provinces_list هیچ باکسی ندارد و فیلترهای موجودیتی را به جدول نمی‌فرستد', async () => {
    expect(await fetchListFilterBox('provinces', 'province', {}, PERIOD)).toEqual({
      status: 'absent',
    });
    expect(getJson).not.toHaveBeenCalled();

    getJson.mockResolvedValue({ data: [], hasNextPage: false });
    await fetchListPage('provinces', {
      filters: { province: 'p1' },
      query: 'قم',
      period: PERIOD,
      page: 1,
    });
    expect(searchParamsOf()).toEqual({ search: 'قم', page: 1, limit: 50 });
  });

  it('باکسی خارج از سقف گزارش بدون صدازدن API مخفی است', async () => {
    expect(await fetchListFilterBox('faculties', 'region', {}, PERIOD)).toEqual({
      status: 'absent',
    });
    expect(getJson).not.toHaveBeenCalled();
  });

  it('جدول idها را با نام‌های Nest می‌فرستد و «همه» را نمی‌فرستد', async () => {
    getJson.mockResolvedValue({ data: [{ id: 'p1', title: 'دبیرستان نمونه' }], hasNextPage: true });
    const result = await fetchListPage('schools', {
      filters: { province: 'p1', city: '', region: 'd1' },
      query: ' نمونه ',
      period: PERIOD,
      page: 2,
    });
    expect(searchParamsOf()).toEqual({
      provinceId: 'p1',
      educationalDistrictId: 'd1',
      search: 'نمونه',
      page: 2,
      limit: 50,
    });
    expect(result.hasNextPage).toBe(true);
    expect(result.rows[0]).toMatchObject({ id: 'p1', name: 'دبیرستان نمونه' });
  });

  it('کلید غایب یا ۴۰۳ یعنی باکس برای نقش نیست؛ ۴۰۰ یعنی تعارض', async () => {
    getJson.mockResolvedValueOnce({ cities: [] });
    expect(await fetchListFilterBox('schools', 'province', {}, PERIOD)).toEqual({
      status: 'absent',
    });
    getJson.mockRejectedValueOnce(new ApiClientError('ممنوع', 404));
    expect(await fetchListFilterBox('schools', 'city', {}, PERIOD)).toEqual({
      status: 'absent',
    });
    getJson.mockRejectedValueOnce(new ApiClientError('ناسازگار', 400));
    expect(await fetchListFilterBox('schools', 'region', {}, PERIOD)).toEqual({
      status: 'conflict',
      message: 'ناسازگار',
    });
  });

  it('آبشار فقط داخل سقف گزارش محاسبه می‌شود (دانشکده به مدرسه وصل نیست)', () => {
    expect(listReportDescendantKeys('teachers', 'province').sort()).toEqual(
      ['city', 'region', 'school', 'teacher'].sort()
    );
    expect(listReportDescendantKeys('faculties', 'province')).toEqual(['city']);
    expect(listReportDescendantKeys('provinces', 'province')).toEqual([]);
  });

  it('نگاشت ردیف عمومی چند نام محتمل را می‌پذیرد', () => {
    expect(
      mapListRow({ _id: 'x', title: 'دانشکدهٔ فنی', city: { title: 'شیراز' } }, 0)
    ).toMatchObject({ id: 'x', name: 'دانشکدهٔ فنی', cityName: 'شیراز' });
  });
});
