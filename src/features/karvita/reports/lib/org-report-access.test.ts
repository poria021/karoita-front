import { describe, expect, it } from 'vitest';

import { buildApprovedDocument } from '@/features/karvita/report-access/lib/access-matrix';
import { RouteService } from '@/services/route.service';
import { isSidebarMenuGroup } from '@/utils/role-strategy/types';

import {
  allOrgRoutableReportSlugs,
  canAccessOrgReportSlug,
  canCompareOrgReportSlug,
  defaultOrgReportSlug,
  grantedOrgReportSlugs,
  extraReportFilterKeysForRole,
  hiddenReportFilterKeysForRole,
  isOrgReportsRole,
  orgApprovedReportSlugs,
  orgCatalogReportSlugs,
  orgReportsSidebarEntries,
  orgReportsSidebarGroup,
  withOrgReportAccessMenu,
} from './org-report-access';

const PIDS = ['p0', 'p1', 'p2'];

describe('org-report-access', () => {
  it('treats all document org roles as org reports roles', () => {
    expect(isOrgReportsRole('mentor_teacher')).toBe(true);
    expect(isOrgReportsRole('supervisor_professor')).toBe(true);
    expect(isOrgReportsRole('school_principal')).toBe(true);
    expect(isOrgReportsRole('regional_edu_admin')).toBe(true);
    expect(isOrgReportsRole('faculty_role')).toBe(true);
    expect(isOrgReportsRole('central_organization')).toBe(true);
    expect(isOrgReportsRole('provincial_university')).toBe(true);
    expect(isOrgReportsRole('super_admin')).toBe(false);
    expect(isOrgReportsRole('assistant_admin')).toBe(false);
  });

  it('exposes approved and catalog pages per role', () => {
    expect(orgApprovedReportSlugs('mentor_teacher')).toEqual(['learners']);
    expect(orgCatalogReportSlugs('mentor_teacher')).toEqual([
      'learners',
      'attendance',
      'scores',
    ]);
    expect(defaultOrgReportSlug('supervisor_professor')).toBe('learners');
    expect(allOrgRoutableReportSlugs()).toContain('scores');
    expect(allOrgRoutableReportSlugs()).toContain('province-performance');
  });

  it('gates access from matrix and rebuilds sidebar group', () => {
    const matrix = buildApprovedDocument(PIDS);
    expect(
      canAccessOrgReportSlug('mentor_teacher', 'learners', matrix, ['p0'])
    ).toBe(true);
    expect(
      canAccessOrgReportSlug('mentor_teacher', 'attendance', matrix, ['p0'])
    ).toBe(false);
    expect(
      canAccessOrgReportSlug('mentor_teacher', 'attendance', null, ['p0'])
    ).toBe(false);
    expect(
      canCompareOrgReportSlug('school_principal', 'teacher-performance', matrix, [
        'p0',
      ])
    ).toBe(false);

    const granted = grantedOrgReportSlugs('mentor_teacher', matrix, ['p0']);
    expect(granted).toEqual(['learners']);

    const staticMenu = [
      { title: 'میز کار', path: '/karvita/dashboard', icon: 'fa-home' },
      orgReportsSidebarGroup('mentor_teacher'),
      {
        title: 'اطلاعیه‌ها و اعلانات',
        path: '/karvita/announcements',
        icon: 'fa-bullhorn',
      },
    ];

    const withExtra = withOrgReportAccessMenu(
      staticMenu,
      'mentor_teacher',
      ['learners', 'attendance']
    );
    const group = withExtra.find(isSidebarMenuGroup);
    expect(group?.children.map((c) => c.path)).toEqual([
      RouteService.karvita.orgReports('learners'),
      RouteService.karvita.orgReports('attendance'),
    ]);

    const empty = withOrgReportAccessMenu(staticMenu, 'mentor_teacher', []);
    expect(empty.find(isSidebarMenuGroup)).toBeUndefined();
    expect(empty.map((e) => ('path' in e ? e.path : e.title))).toEqual([
      '/karvita/dashboard',
      '/karvita/announcements',
    ]);

    expect(
      withOrgReportAccessMenu(staticMenu, 'mentor_teacher', null)
    ).toEqual(staticMenu);
  });

  it('splits central organization reports into themed sidebar modules', () => {
    const groups = orgReportsSidebarEntries('central_organization');
    expect(groups.map((g) => g.title)).toEqual([
      'گزارش‌های لیستی',
      'حضور و غیاب',
      'گزارش‌های عملکرد',
    ]);
    expect(groups[0]?.children.map((c) => c.title)).toEqual([
      'لیست فراگیران',
      'لیست معلمان',
      'لیست مدیران مدارس',
      'لیست اساتید',
      'لیست مدارس',
      'لیست دانشکده‌ها',
      'لیست استان‌ها',
    ]);
    expect(groups[1]?.children.map((c) => c.title)).toEqual([
      'حضور و غیاب فراگیران',
      'حضور و غیاب اساتید راهنما',
    ]);
    expect(groups[2]?.children.map((c) => c.title)).toEqual([
      'عملکرد معلمان',
      'عملکرد مدارس',
      'عملکرد اساتید',
      'عملکرد دانشکده‌ها',
      'عملکرد استان‌ها',
    ]);

    const matrix = buildApprovedDocument(PIDS);
    const granted = grantedOrgReportSlugs('central_organization', matrix, []);
    const menu = withOrgReportAccessMenu(
      [
        { title: 'میز کار', path: '/karvita/dashboard', icon: 'fa-home' },
        ...orgReportsSidebarEntries('central_organization'),
        {
          title: 'اطلاعیه‌ها و اعلانات',
          path: '/karvita/announcements',
          icon: 'fa-bullhorn',
        },
      ],
      'central_organization',
      [...granted].reverse()
    );
    const reportGroups = menu.filter(isSidebarMenuGroup);
    expect(reportGroups.map((g) => g.title)).toEqual([
      'گزارش‌های لیستی',
      'حضور و غیاب',
      'گزارش‌های عملکرد',
    ]);
    expect(
      reportGroups.flatMap((g) => g.children.map((c) => c.path))
    ).toContain(RouteService.karvita.orgReports('province-performance'));
  });

  it('splits provincial university reports into themed sidebar modules', () => {
    const groups = orgReportsSidebarEntries('provincial_university');
    expect(groups.map((g) => g.title)).toEqual([
      'گزارش‌های لیستی',
      'حضور و غیاب',
      'گزارش‌های عملکرد',
    ]);
    expect(groups[0]?.children.map((c) => c.title)).toEqual([
      'لیست فراگیران',
      'لیست اساتید',
      'لیست دانشکده‌ها',
    ]);
    expect(groups[1]?.children.map((c) => c.title)).toEqual([
      'حضور و غیاب فراگیران',
      'حضور و غیاب اساتید راهنما',
    ]);
    expect(groups[2]?.children.map((c) => c.title)).toEqual([
      'عملکرد اساتید',
      'عملکرد دانشکده‌ها',
    ]);
  });

  it('splits regional edu admin reports into themed sidebar modules', () => {
    const groups = orgReportsSidebarEntries('regional_edu_admin');
    expect(groups.map((g) => g.title)).toEqual([
      'گزارش‌های لیستی',
      'گزارش‌های عملکرد',
    ]);
    expect(groups[0]?.children.map((c) => c.title)).toEqual([
      'لیست فراگیران',
      'لیست معلمان',
      'لیست مدیران مدارس',
      'لیست مدارس',
    ]);
    expect(groups[1]?.children.map((c) => c.title)).toEqual([
      'عملکرد معلمان',
      'عملکرد مدارس',
    ]);
  });

  it('hides scoped filters for regional, principal, mentor, and supervisor roles', () => {
    expect(hiddenReportFilterKeysForRole('regional_edu_admin')).toEqual([
      'province',
      'city',
    ]);
    expect(hiddenReportFilterKeysForRole('school_principal')).toEqual([
      'province',
      'city',
      'region',
      'school',
      'faculty',
      'professor',
    ]);
    expect(hiddenReportFilterKeysForRole('mentor_teacher')).toEqual([
      'province',
      'city',
      'faculty',
      'teacher',
      'professor',
    ]);
    expect(hiddenReportFilterKeysForRole('supervisor_professor')).toEqual([
      'province',
      'city',
      'region',
      'professor',
    ]);
    expect(
      hiddenReportFilterKeysForRole('supervisor_professor', 'learners')
    ).toEqual(['province', 'city', 'region', 'professor']);
    expect(
      hiddenReportFilterKeysForRole('supervisor_professor', 'scores')
    ).toEqual(['province', 'city', 'region', 'professor']);
    expect(
      hiddenReportFilterKeysForRole('regional_edu_admin', 'learners')
    ).toEqual(['province', 'city', 'faculty', 'professor']);
    expect(
      hiddenReportFilterKeysForRole('regional_edu_admin', 'teachers')
    ).toEqual(['province', 'city']);
    expect(hiddenReportFilterKeysForRole('central_organization')).toEqual([]);
    expect(hiddenReportFilterKeysForRole('faculty_role')).toEqual([]);
  });

  it('adds teacher filter for school principal except teacher-performance', () => {
    expect(extraReportFilterKeysForRole('school_principal', 'learners')).toEqual(
      ['teacher']
    );
    expect(
      extraReportFilterKeysForRole('school_principal', 'attendance')
    ).toEqual(['teacher']);
    expect(
      extraReportFilterKeysForRole('school_principal', 'teacher-performance')
    ).toEqual([]);
    expect(extraReportFilterKeysForRole('regional_edu_admin', 'learners')).toEqual(
      []
    );
  });

  it('keeps mentor scores filters aligned with learners (region + school only)', () => {
    expect(hiddenReportFilterKeysForRole('mentor_teacher', 'scores')).toEqual([
      'province',
      'city',
      'faculty',
      'teacher',
      'professor',
    ]);
    expect(extraReportFilterKeysForRole('mentor_teacher', 'scores')).toEqual([
      'region',
      'school',
    ]);
  });

  it('scopes scores filters to province/city/faculty by senior org role', () => {
    expect(hiddenReportFilterKeysForRole('super_admin', 'scores')).toEqual([
      'region',
      'school',
      'professor',
      'teacher',
    ]);
    expect(extraReportFilterKeysForRole('super_admin', 'scores')).toEqual([
      'province',
      'city',
    ]);
    expect(
      hiddenReportFilterKeysForRole('central_organization', 'scores')
    ).toEqual(['region', 'school', 'professor', 'teacher']);
    expect(
      extraReportFilterKeysForRole('central_organization', 'scores')
    ).toEqual(['province', 'city']);
    expect(
      hiddenReportFilterKeysForRole('provincial_university', 'scores')
    ).toEqual(['province', 'region', 'school', 'professor', 'teacher']);
    expect(
      extraReportFilterKeysForRole('provincial_university', 'scores')
    ).toEqual(['city']);
    expect(hiddenReportFilterKeysForRole('faculty_role', 'scores')).toEqual([
      'province',
      'faculty',
      'region',
      'school',
      'professor',
      'teacher',
    ]);
    expect(extraReportFilterKeysForRole('faculty_role', 'scores')).toEqual([
      'city',
    ]);
  });
});
