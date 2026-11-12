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
  isOrgReportsRole,
  orgApprovedReportSlugs,
  orgCatalogReportSlugs,
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
});
