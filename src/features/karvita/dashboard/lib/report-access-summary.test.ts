import { describe, expect, it } from 'vitest';

import type { ReportAccessRoleRow } from '@/types/report-access';

import { reportAccessTone, summarizeReportAccess } from './report-access-summary';

const rows: ReportAccessRoleRow[] = [
  {
    roleId: 'central_organization',
    reports: [
      { slug: 'learners', access: 'default', status: 'active', enabled: true },
      { slug: 'attendance', access: 'optional', status: 'active', enabled: true },
      { slug: 'scores', access: 'optional', status: 'inactive', enabled: false },
    ],
  },
  { roleId: 'mentor_teacher', reports: [] },
];

describe('summarizeReportAccess', () => {
  it('counts allowed, active and pending optional reports per role', () => {
    expect(summarizeReportAccess(rows)).toEqual([
      {
        roleId: 'central_organization',
        total: 3,
        active: 2,
        pendingOptional: 1,
      },
      { roleId: 'mentor_teacher', total: 0, active: 0, pendingOptional: 0 },
    ]);
  });
});

describe('reportAccessTone', () => {
  it('flags roles with nothing active, partial and full', () => {
    expect(reportAccessTone({ total: 0, active: 0 })).toBe('none');
    expect(reportAccessTone({ total: 3, active: 2 })).toBe('partial');
    expect(reportAccessTone({ total: 3, active: 3 })).toBe('full');
  });
});
