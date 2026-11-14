import { describe, expect, it } from 'vitest';

import {
  mapMyReportAccess,
  mapReportAccessMatrix,
} from '@/services/report-access/real/report-access.mappers';

describe('mapMyReportAccess', () => {
  it('splits active/inactive and hides everything not listed', () => {
    const result = mapMyReportAccess({
      role: 'school_admin',
      reports: [
        { report: 'learners_list', status: 'active' },
        { report: 'learners_attendance', status: 'inactive' },
      ],
    });
    expect(result.active).toEqual(['learners']);
    expect(result.inactive).toEqual(['attendance']);
    expect(result.compare).toEqual([]);
  });

  it('ignores unknown reports/statuses and malformed payloads', () => {
    expect(
      mapMyReportAccess({
        reports: [
          { report: 'nope', status: 'active' },
          { report: 'teachers_list', status: 'weird' },
          null,
          { report: 'teachers_list', status: 'active' },
          { report: 'teachers_list', status: 'inactive' },
        ],
      })
    ).toEqual({ active: ['teachers'], inactive: [], compare: [] });
    expect(mapMyReportAccess(null)).toEqual({
      active: [],
      inactive: [],
      compare: [],
    });
  });
});

describe('mapReportAccessMatrix', () => {
  it('maps roles, default/optional rows and the enabled flag', () => {
    const result = mapReportAccessMatrix([
      {
        role: 'school_admin',
        reports: [
          { report: 'learners_list', access: 'default', status: 'active' },
          {
            report: 'learners_attendance',
            access: 'optional',
            status: 'inactive',
            enabled: false,
          },
        ],
      },
      { role: 'superadmin', reports: [] },
    ]);

    expect(result).toEqual([
      {
        roleId: 'school_principal',
        reports: [
          { slug: 'learners', access: 'default', status: 'active', enabled: true },
          {
            slug: 'attendance',
            access: 'optional',
            status: 'inactive',
            enabled: false,
          },
        ],
      },
    ]);
  });

  it('falls back to status when optional rows omit enabled', () => {
    const [role] = mapReportAccessMatrix([
      {
        role: 'teacher',
        reports: [
          { report: 'learners_list', access: 'optional', status: 'active' },
        ],
      },
    ]);
    expect(role?.roleId).toBe('mentor_teacher');
    expect(role?.reports[0]?.enabled).toBe(true);
  });

  it('returns [] for non-array payloads', () => {
    expect(mapReportAccessMatrix({})).toEqual([]);
  });
});
