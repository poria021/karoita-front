import { describe, expect, it } from 'vitest';

import { buildApprovedDocument } from '@/features/karvita/report-access/lib/access-matrix';
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
    // ماژول گزارش‌ها خاموش است → هیچ اسلاگی قابل دسترسی نیست
    expect(
      canAccessOrgReportSlug('mentor_teacher', 'learners', matrix, ['p0'])
    ).toBe(false);
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
    expect(withExtra.find(isSidebarMenuGroup)).toBeUndefined();
    expect(withExtra.map((e) => ('path' in e ? e.path : e.title))).toEqual([
      '/karvita/dashboard',
      '/karvita/announcements',
    ]);

    const empty = withOrgReportAccessMenu(staticMenu, 'mentor_teacher', []);
    expect(empty.find(isSidebarMenuGroup)).toBeUndefined();
    expect(empty.map((e) => ('path' in e ? e.path : e.title))).toEqual([
      '/karvita/dashboard',
      '/karvita/announcements',
    ]);

    expect(
      withOrgReportAccessMenu(staticMenu, 'mentor_teacher', null)
    ).toEqual([
      { title: 'میز کار', path: '/karvita/dashboard', icon: 'fa-home' },
      {
        title: 'اطلاعیه‌ها و اعلانات',
        path: '/karvita/announcements',
        icon: 'fa-bullhorn',
      },
    ]);
  });

  it('hides themed org report sidebar modules while reports module is off', () => {
    expect(orgReportsSidebarEntries('central_organization')).toEqual([]);
    expect(orgReportsSidebarEntries('provincial_university')).toEqual([]);
    expect(orgReportsSidebarEntries('regional_edu_admin')).toEqual([]);

    const matrix = buildApprovedDocument(PIDS);
    const granted = grantedOrgReportSlugs('central_organization', matrix, []);
    const menu = withOrgReportAccessMenu(
      [
        { title: 'میز کار', path: '/karvita/dashboard', icon: 'fa-home' },
        {
          title: 'اطلاعیه‌ها و اعلانات',
          path: '/karvita/announcements',
          icon: 'fa-bullhorn',
        },
      ],
      'central_organization',
      [...granted].reverse()
    );
    expect(menu.filter(isSidebarMenuGroup)).toEqual([]);
    expect(menu.map((e) => ('path' in e ? e.path : e.title))).toEqual([
      '/karvita/dashboard',
      '/karvita/announcements',
    ]);
  });

  it('applies the same allowlisted filters on every report slug', () => {
    expect(extraReportFilterKeysForRole('super_admin', 'learners')).toEqual([]);
    expect(hiddenReportFilterKeysForRole('super_admin', 'learners')).toEqual([]);
    expect(
      extraReportFilterKeysForRole('central_organization', 'attendance')
    ).toEqual([]);
    expect(
      hiddenReportFilterKeysForRole('central_organization', 'attendance')
    ).toEqual([]);

    expect(extraReportFilterKeysForRole('faculty_role', 'learners')).toEqual([
      'professor',
      'school',
    ]);
    expect(hiddenReportFilterKeysForRole('faculty_role', 'learners')).toEqual([
      'province',
      'city',
      'region',
      'faculty',
      'teacher',
      'course',
      'major',
      'status',
    ]);

    expect(
      extraReportFilterKeysForRole('regional_edu_admin', 'teachers')
    ).toEqual(['school', 'teacher']);
    expect(
      hiddenReportFilterKeysForRole('regional_edu_admin', 'teachers')
    ).toEqual([
      'province',
      'city',
      'region',
      'faculty',
      'professor',
      'course',
      'major',
      'status',
    ]);

    expect(
      extraReportFilterKeysForRole('school_principal', 'attendance')
    ).toEqual(['teacher']);
    expect(
      hiddenReportFilterKeysForRole('school_principal', 'attendance')
    ).toEqual([
      'province',
      'city',
      'region',
      'school',
      'faculty',
      'professor',
      'course',
      'major',
      'status',
    ]);

    expect(extraReportFilterKeysForRole('mentor_teacher', 'learners')).toEqual([
      'region',
      'school',
    ]);
    expect(hiddenReportFilterKeysForRole('mentor_teacher', 'learners')).toEqual([
      'province',
      'city',
      'faculty',
      'professor',
      'teacher',
      'course',
      'major',
      'status',
    ]);

    expect(
      extraReportFilterKeysForRole('supervisor_professor', 'learners')
    ).toEqual(['province', 'faculty', 'school']);
    expect(
      hiddenReportFilterKeysForRole('supervisor_professor', 'learners')
    ).toEqual([
      'city',
      'region',
      'professor',
      'teacher',
      'course',
      'major',
      'status',
    ]);

    // یکسان برای همهٔ اسلاگ‌ها
    expect(extraReportFilterKeysForRole('faculty_role', 'attendance')).toEqual(
      extraReportFilterKeysForRole('faculty_role', 'learners')
    );
    expect(
      extraReportFilterKeysForRole('school_principal', 'teacher-performance')
    ).toEqual(['teacher']);
  });
});
