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
  fetchListFilterBoxes,
  fetchListPage,
  isListReportFilterKey,
  listReportDescendantKeys,
  nestExportPath,
  nestFiltersPath,
  nestTablePath,
  usesBatchFilterBoxes,
} from '@/services/reports/real/list-reports.api';
import {
  mapPerformanceRow,
  PERFORMANCE_COLUMNS,
} from '@/services/reports/real/performance-report.mappers';
import type { ReportPeriodState } from '@/types/reports';

const TERM: ReportPeriodState = {
  mode: 'term',
  termId: 't0',
  moduleId: 'm1',
  semesterId: 's1',
};
const NO_PERIOD: ReportPeriodState = { mode: 'term', termId: 't0', moduleId: 'm1' };

function searchParamsOf(callIndex = 0): Record<string, string | number> {
  return getJson.mock.calls[callIndex]![2].searchParams;
}

describe('گزارش‌های عملکرد (Nest)', () => {
  beforeEach(() => {
    getJson.mockReset();
  });

  it('مسیر فیلتر، جدول و خروجی هر گزارش مطابق مستند است', () => {
    expect(nestFiltersPath('teacher-performance')).toBe(
      'v1/reports/filters/teachers_performance'
    );
    expect(nestFiltersPath('province-performance')).toBe(
      'v1/reports/filters/provinces_performance'
    );
    expect(nestTablePath('school-performance')).toBe(
      'v1/reports/schools/performance'
    );
    expect(nestExportPath('faculty-performance')).toBe(
      'v1/reports/faculties/performance/export'
    );
    expect(nestExportPath('professor-performance')).toBe(
      'v1/reports/professors/performance/export'
    );
  });

  it('همهٔ گزارش‌های عملکرد باکس‌ها را یک‌جا و بدون field می‌گیرند', () => {
    for (const slug of [
      'teacher-performance',
      'school-performance',
      'professor-performance',
      'faculty-performance',
      'province-performance',
    ] as const) {
      expect(usesBatchFilterBoxes(slug)).toBe(true);
    }
    expect(usesBatchFilterBoxes('schools')).toBe(false);
  });

  it('سقف باکس هر گزارش طبق مستند است', () => {
    expect(isListReportFilterKey('teacher-performance', 'teacher')).toBe(true);
    expect(isListReportFilterKey('teacher-performance', 'faculty')).toBe(false);
    expect(isListReportFilterKey('school-performance', 'school')).toBe(true);
    expect(isListReportFilterKey('professor-performance', 'faculty')).toBe(true);
    expect(isListReportFilterKey('professor-performance', 'region')).toBe(false);
    expect(isListReportFilterKey('professor-performance', 'school')).toBe(false);
    expect(isListReportFilterKey('faculty-performance', 'city')).toBe(true);
    expect(isListReportFilterKey('faculty-performance', 'faculty')).toBe(false);
    expect(isListReportFilterKey('province-performance', 'province')).toBe(false);
  });

  it('درخواست یک‌جای باکس‌ها بدون field و فقط با idهای انتخاب‌شده می‌رود', async () => {
    getJson.mockResolvedValue({
      provinces: [{ id: 'p1', title: 'قم' }],
      cities: [{ id: 'c1', title: 'قم' }],
    });
    const boxes = await fetchListFilterBoxes(
      'teacher-performance',
      { province: 'p1', city: '' },
      TERM
    );
    expect(getJson.mock.calls[0]![0]).toBe(
      'v1/reports/filters/teachers_performance'
    );
    expect(searchParamsOf()).toEqual({
      provinceId: 'p1',
      structure: 'semester',
      semesterId: 's1',
    });
    expect(boxes.province).toEqual({
      status: 'ok',
      options: [{ value: 'p1', label: 'قم' }],
    });
    // کلیدی که نیامده یعنی برای نقش مخفی است.
    expect(boxes.region).toEqual({ status: 'absent' });
    expect(boxes.teacher).toEqual({ status: 'absent' });
  });

  it('پاسخ آبجکت خالی همهٔ باکس‌ها را مخفی می‌کند', async () => {
    getJson.mockResolvedValue({});
    const boxes = await fetchListFilterBoxes('school-performance', {}, NO_PERIOD);
    expect(Object.values(boxes).every((b) => b?.status === 'absent')).toBe(true);
    expect(searchParamsOf()).toEqual({ structure: 'semester' });
  });

  it('عملکرد استان‌ها هیچ باکسی ندارد و درخواستی نمی‌فرستد', async () => {
    expect(
      await fetchListFilterBoxes('province-performance', {}, TERM)
    ).toEqual({});
    expect(getJson).not.toHaveBeenCalled();
  });

  it('۴۰۰ filterOutOfScope روی باکس‌ها تعارض گزارش می‌شود', async () => {
    getJson.mockRejectedValueOnce(new ApiClientError('خارج از محدوده', 400));
    const boxes = await fetchListFilterBoxes(
      'faculty-performance',
      { province: 'x' },
      NO_PERIOD
    );
    expect(boxes.province).toEqual({
      status: 'conflict',
      message: 'خارج از محدوده',
    });
  });

  it('آبشار: عملکرد مدارس معلم را والد مدرسه می‌داند، نه برعکس', () => {
    expect(listReportDescendantKeys('school-performance', 'teacher')).toEqual([
      'school',
    ]);
    expect(listReportDescendantKeys('school-performance', 'school')).toEqual([]);
    expect(
      listReportDescendantKeys('school-performance', 'province').sort()
    ).toEqual(['city', 'region', 'school', 'teacher'].sort());
  });

  it('آبشار عملکرد معلمان: مدرسه معلم را محدود می‌کند', () => {
    expect(listReportDescendantKeys('teacher-performance', 'school')).toEqual([
      'teacher',
    ]);
  });

  it('آبشار عملکرد اساتید: شهر دانشکده را محدود می‌کند', () => {
    expect(
      listReportDescendantKeys('professor-performance', 'city')
    ).toEqual(['faculty']);
    expect(listReportDescendantKeys('faculty-performance', 'province')).toEqual([
      'city',
    ]);
  });

  it('جدول عملکرد معلمان پارامترهای Nest را می‌فرستد و «همه» را نه', async () => {
    getJson.mockResolvedValue({ data: [], hasNextPage: false });
    await fetchListPage('teacher-performance', {
      filters: {
        province: 'p1',
        city: '',
        region: 'd1',
        school: 's1',
        teacher: 't1',
        faculty: 'ignored',
      },
      query: ' علی ',
      period: TERM,
      page: 2,
    });
    expect(getJson.mock.calls[0]![0]).toBe('v1/reports/teachers/performance');
    expect(searchParamsOf()).toEqual({
      provinceId: 'p1',
      educationalDistrictId: 'd1',
      schoolId: 's1',
      teacherId: 't1',
      structure: 'semester',
      semesterId: 's1',
      search: 'علی',
      page: 2,
      limit: 50,
    });
  });

  it('عملکرد اساتید منطقه/مدرسه/معلم را نمی‌فرستد', async () => {
    getJson.mockResolvedValue({ data: [], hasNextPage: false });
    await fetchListPage('professor-performance', {
      filters: { province: 'p1', faculty: 'u1', region: 'd1', school: 's1', teacher: 't1' },
      query: '',
      period: NO_PERIOD,
      page: 1,
    });
    expect(searchParamsOf()).toEqual({
      structure: 'semester',
      provinceId: 'p1',
      universityId: 'u1',
      page: 1,
      limit: 50,
    });
  });

  it('عملکرد استان‌ها هیچ id سازمانی نمی‌فرستد', async () => {
    getJson.mockResolvedValue({ data: [], hasNextPage: false });
    await fetchListPage('province-performance', {
      filters: { province: 'p1', city: 'c1' },
      query: 'قم',
      period: NO_PERIOD,
      page: 1,
    });
    expect(getJson.mock.calls[0]![0]).toBe('v1/reports/provinces/performance');
    expect(searchParamsOf()).toEqual({ structure: 'semester', search: 'قم', page: 1, limit: 50 });
  });

  it('ردیف معلم: مدرسه با منطقه، تعداد فراگیر و نرخ پاسخ', () => {
    expect(
      mapPerformanceRow(
        'teacher-performance',
        {
          id: 't1',
          fullName: 'علی رضایی',
          personnelCode: '123',
          phone: '0912',
          school: { title: 'دبیرستان نمونه', district: 'منطقه ۱' },
          learnerCount: 12,
          responseRate: 80,
        },
        0
      )
    ).toMatchObject({
      id: 't1',
      name: 'علی رضایی',
      code: '123',
      phone: '0912',
      schoolName: 'دبیرستان نمونه',
      regionName: 'منطقه ۱',
      n: 12,
      resp: 80,
    });
  });

  it('ردیف مدرسه: جنسیت فارسی و averageScore نال خالی می‌ماند', () => {
    const row = mapPerformanceRow(
      'school-performance',
      {
        id: 's1',
        title: 'مدرسه الف',
        gender: 'Girl',
        adminName: 'مریم',
        adminPersonnelCode: '77',
        responseRate: 55,
        averageScore: null,
      },
      0
    );
    expect(row).toMatchObject({
      name: 'مدرسه الف',
      genderLabel: 'دخترانه',
      head: 'مریم',
      code: '77',
      resp: 55,
    });
    expect(row?.score).toBeUndefined();
  });

  it('ردیف استاد، دانشکده و استان سه عدد را جدا نگه می‌دارد', () => {
    expect(
      mapPerformanceRow(
        'professor-performance',
        {
          id: 'p',
          fullName: 'دکتر الف',
          personnelCode: '9',
          phone: '0935',
          attendancePercent: 90,
          responseRate: 70,
          averageScore: 17.5,
        },
        0
      )
    ).toMatchObject({ att: 90, resp: 70, score: 17.5, code: '9' });
    expect(
      mapPerformanceRow(
        'faculty-performance',
        {
          id: 'f',
          title: 'فنی',
          province: 'فارس',
          city: 'شیراز',
          attendancePercent: 1,
          responseRate: 2,
          averageScore: 3,
        },
        0
      )
    ).toMatchObject({ name: 'فنی', provName: 'فارس', cityName: 'شیراز', att: 1, resp: 2, score: 3 });
    expect(
      mapPerformanceRow(
        'province-performance',
        { id: 'x', title: 'قم', head: 'آقای ب', attendancePercent: 5, responseRate: 6, averageScore: null },
        0
      )
    ).toMatchObject({ name: 'قم', head: 'آقای ب', att: 5, resp: 6 });
  });

  it('ردیف نامعتبر نگاشت نمی‌شود و هر گزارش ستون دارد', () => {
    expect(mapPerformanceRow('teacher-performance', null, 0)).toBeNull();
    for (const columns of Object.values(PERFORMANCE_COLUMNS)) {
      expect(columns.length).toBeGreaterThan(0);
    }
  });
});
