import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getJson } = vi.hoisted(() => ({ getJson: vi.fn() }));

vi.mock('@/services/api-client', async () => {
  const { ApiClientError } = await import('@/services/api-error');
  return {
    ApiClientError,
    apiClient: { getJson, baseUrl: 'http://localhost/api/nest' },
  };
});

import {
  fetchLearnersFilterBox,
  fetchLearnersPage,
  mapLearnerAttendanceRow,
  NEST_LEARNERS_ATTENDANCE_PATHS,
} from '@/services/reports/real/learners-report.api';
import {
  fetchListFilterBox,
  fetchListPage,
  isListReportFilterKey,
  isListReportSlug,
  listReportDescendantKeys,
  mapListRow,
  nestExportPath,
} from '@/services/reports/real/list-reports.api';
import type { ReportPeriodState } from '@/types/reports';

const PERIOD: ReportPeriodState = {
  mode: 'term',
  termId: 't0',
  moduleId: 'm1',
};
const REAL_PERIOD: ReportPeriodState = { ...PERIOD, semesterId: 'sem-1' };

function searchParamsOf(callIndex = 0): Record<string, string | number> {
  return getJson.mock.calls[callIndex]![2].searchParams;
}

describe('حضور و غیاب فراگیران', () => {
  beforeEach(() => getJson.mockReset());

  it('مسیرها مطابق مستند است', () => {
    expect(NEST_LEARNERS_ATTENDANCE_PATHS).toEqual({
      filters: 'v1/reports/filters/learners_attendance',
      table: 'v1/reports/learners/attendance',
      export: 'v1/reports/learners/attendance/export',
    });
  });

  it('باکس فیلتر را از learners_attendance می‌گیرد و والدها را می‌فرستد', async () => {
    getJson.mockResolvedValue({ cities: [{ id: 'c1', title: 'قم' }] });
    const box = await fetchLearnersFilterBox(
      'city',
      { province: 'p1' },
      REAL_PERIOD,
      undefined,
      NEST_LEARNERS_ATTENDANCE_PATHS
    );
    expect(getJson.mock.calls[0]![0]).toBe(
      'v1/reports/filters/learners_attendance'
    );
    expect(searchParamsOf()).toEqual({
      field: 'city',
      provinceId: 'p1',
      structure: 'semester',
      semesterId: 'sem-1',
    });
    expect(box).toEqual({
      status: 'ok',
      options: [{ value: 'c1', label: 'قم' }],
    });
  });

  it('پاسخ خالی ({}) یعنی باکس برای این نقش مخفی است', async () => {
    getJson.mockResolvedValue({});
    expect(
      await fetchLearnersFilterBox(
        'province',
        {},
        PERIOD,
        undefined,
        NEST_LEARNERS_ATTENDANCE_PATHS
      )
    ).toEqual({ status: 'absent' });
  });

  it('بدون دورهٔ واقعی structure/semesterId نمی‌فرستد و «همه» را نمی‌فرستد', async () => {
    getJson.mockResolvedValue({ data: [], hasNextPage: false });
    await fetchLearnersPage({
      filters: { province: 'p1', city: '', faculty: 'u1', school: 's1' },
      query: ' علی ',
      period: PERIOD,
      page: 1,
      limit: 5000,
      paths: NEST_LEARNERS_ATTENDANCE_PATHS,
      mapRow: mapLearnerAttendanceRow,
    });
    expect(getJson.mock.calls[0]![0]).toBe('v1/reports/learners/attendance');
    expect(searchParamsOf()).toEqual({
      provinceId: 'p1',
      universityId: 'u1',
      schoolId: 's1',
      search: 'علی',
      page: 1,
      limit: 50,
    });
  });

  it('ردیف را طبق مستند نگاشت می‌کند', () => {
    const row = mapLearnerAttendanceRow(
      {
        id: 'l1',
        fullName: 'علی رضایی',
        phone: '09120000000',
        degree: 'کارشناسی',
        lessons: { title: 'کارورزی ۱', extraCount: 2 },
        university: 'دانشکدهٔ فنی',
        province: 'قم',
        school: { title: 'دبیرستان نمونه', district: 'منطقه ۱' },
        attendancePercent: 87.5,
      },
      0
    );
    expect(row).toMatchObject({
      id: 'l1',
      name: 'علی رضایی',
      phone: '09120000000',
      major: 'کارشناسی',
      courses: ['کارورزی ۱'],
      courseExtraCount: 2,
      facName: 'دانشکدهٔ فنی',
      provName: 'قم',
      schoolName: 'دبیرستان نمونه',
      regionName: 'منطقه ۱',
      att: 87.5,
    });
  });

  it('درصد حضور صفر معتبر است و ردیف بدون درس خالی می‌ماند', () => {
    const row = mapLearnerAttendanceRow(
      { id: 'l2', fullName: 'نیما', attendancePercent: 0, lessons: { extraCount: 0 } },
      0
    );
    expect(row?.att).toBe(0);
    expect(row?.courses).toEqual([]);
    expect(row?.courseExtraCount).toBe(0);
  });
});

describe('حضور و غیاب اساتید راهنما', () => {
  beforeEach(() => getJson.mockReset());

  it('اسلاگ لیستی است و مسیرها مطابق مستند است', () => {
    expect(isListReportSlug('professor-attendance')).toBe(true);
    expect(nestExportPath('professor-attendance')).toBe(
      'v1/reports/professors/attendance/export'
    );
  });

  it('فقط استان، شهر و دانشکده باکس دارد', () => {
    for (const key of ['province', 'city', 'faculty'] as const) {
      expect(isListReportFilterKey('professor-attendance', key)).toBe(true);
    }
    for (const key of ['region', 'school', 'professor', 'teacher'] as const) {
      expect(isListReportFilterKey('professor-attendance', key)).toBe(false);
    }
    expect(listReportDescendantKeys('professor-attendance', 'province').sort()).toEqual(
      ['city', 'faculty']
    );
  });

  it('باکس فیلتر از professors_attendance گرفته می‌شود', async () => {
    getJson.mockResolvedValue({ universities: [{ id: 'u1', title: 'دانشکده' }] });
    await fetchListFilterBox('professor-attendance', 'faculty', {}, REAL_PERIOD);
    expect(getJson.mock.calls[0]![0]).toBe(
      'v1/reports/filters/professors_attendance'
    );
    expect(searchParamsOf()).toMatchObject({
      field: 'university',
      structure: 'semester',
      semesterId: 'sem-1',
    });
  });

  it('منطقه/مدرسه/استاد/معلم را به جدول نمی‌فرستد', async () => {
    getJson.mockResolvedValue({ data: [], hasNextPage: false });
    await fetchListPage('professor-attendance', {
      filters: {
        province: 'p1',
        city: 'c1',
        faculty: 'u1',
        region: 'd1',
        school: 's1',
        professor: 'pr1',
        teacher: 't1',
      },
      query: 'کد ۱۲',
      period: { mode: 'module', termId: 't0', moduleId: 'm1', semesterId: 'pod-1' },
      page: 3,
    });
    expect(getJson.mock.calls[0]![0]).toBe('v1/reports/professors/attendance');
    expect(searchParamsOf()).toEqual({
      provinceId: 'p1',
      cityId: 'c1',
      universityId: 'u1',
      structure: 'podmani',
      semesterId: 'pod-1',
      search: 'کد ۱۲',
      page: 3,
      limit: 50,
    });
  });

  it('سه نرخ حضور را جدا نگاشت می‌کند', () => {
    expect(
      mapListRow(
        {
          id: 'pr1',
          fullName: 'دکتر احمدی',
          personnelCode: '12345',
          university: 'دانشکدهٔ فنی',
          province: 'قم',
          city: 'قم',
          attendancePercent: 70,
          professorConfirmedRate: 90,
          attendanceRate: 75,
        },
        0
      )
    ).toMatchObject({
      id: 'pr1',
      name: 'دکتر احمدی',
      code: '12345',
      facName: 'دانشکدهٔ فنی',
      provName: 'قم',
      cityName: 'قم',
      att: 70,
      attProf: 90,
      attMgr: 75,
    });
  });
});
