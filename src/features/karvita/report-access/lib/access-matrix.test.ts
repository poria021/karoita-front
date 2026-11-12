import { describe, expect, it } from 'vitest';

import { compareKeyFor } from '@/features/karvita/report-access/constants';
import {
  buildApprovedDocument,
  diffMatrices,
  grantedReportSlugsForRole,
  resolveUserProvinceIds,
  roleHasCompareAccess,
  roleHasReportAccess,
  setAccess,
  setCompare,
  viewAccess,
  viewCompare,
} from '@/features/karvita/report-access/lib/access-matrix';

const PIDS = ['p0', 'p1', 'p2'];

describe('access-matrix', () => {
  it('builds approved document with default pages on and compare off', () => {
    const doc = buildApprovedDocument(PIDS);
    expect(viewAccess(doc, 'mentor_teacher', 'learners', PIDS)).toBe('on');
    expect(viewAccess(doc, 'mentor_teacher', 'attendance', PIDS)).toBe('off');
    expect(viewCompare(doc, 'mentor_teacher', 'attendance')).toBe('locked');
    expect(
      viewAccess(doc, 'supervisor_professor', 'learners', PIDS)
    ).toBe('on');
    expect(
      viewCompare(doc, 'supervisor_professor', 'attendance')
    ).toBe('off');
  });

  it('clears compare provinces when parent report is turned off', () => {
    const draft = buildApprovedDocument(PIDS);
    setCompare(draft, 'supervisor_professor', 'attendance', PIDS, true);
    expect(
      viewCompare(draft, 'supervisor_professor', 'attendance')
    ).toBe('on');
    setAccess(draft, 'supervisor_professor', 'attendance', PIDS, false);
    expect(
      draft.supervisor_professor[compareKeyFor('attendance')]
    ).toEqual([]);
    expect(
      viewCompare(draft, 'supervisor_professor', 'attendance')
    ).toBe('locked');
  });

  it('reports diffs for grant and revoke including compare keys', () => {
    const saved = buildApprovedDocument(PIDS);
    const draft = buildApprovedDocument(PIDS);
    setAccess(draft, 'mentor_teacher', 'attendance', PIDS, true);
    setCompare(draft, 'mentor_teacher', 'attendance', PIDS, true);
    setAccess(draft, 'mentor_teacher', 'learners', PIDS, false);

    const diffs = diffMatrices(saved, draft);
    expect(diffs.some((d) => d.key === 'attendance' && d.add.length === 3)).toBe(
      true
    );
    expect(
      diffs.some(
        (d) => d.key === compareKeyFor('attendance') && d.add.length === 3
      )
    ).toBe(true);
    expect(diffs.some((d) => d.key === 'learners' && d.rem.length === 3)).toBe(
      true
    );
  });

  it('resolves user province names to catalog ids', () => {
    expect(
      resolveUserProvinceIds(['تهران', 'p1'], {
        p0: 'تهران',
        p1: 'خراسان رضوی',
      })
    ).toEqual(['p0', 'p1']);
    expect(resolveUserProvinceIds(undefined, { p0: 'تهران' })).toEqual([]);
  });

  it('gates report and compare access by user province scope', () => {
    const matrix = buildApprovedDocument(PIDS);
    setAccess(matrix, 'mentor_teacher', 'attendance', PIDS, true);
    setCompare(matrix, 'mentor_teacher', 'attendance', PIDS, true, 'p0');

    expect(
      roleHasReportAccess(matrix, 'mentor_teacher', 'learners', ['p1'])
    ).toBe(true);
    expect(
      roleHasReportAccess(matrix, 'mentor_teacher', 'attendance', ['p0'])
    ).toBe(true);
    expect(
      roleHasReportAccess(matrix, 'mentor_teacher', 'scores', ['p0'])
    ).toBe(false);

    expect(
      roleHasCompareAccess(matrix, 'mentor_teacher', 'attendance', ['p0'])
    ).toBe(true);
    expect(
      roleHasCompareAccess(matrix, 'mentor_teacher', 'attendance', ['p1'])
    ).toBe(false);

    // حوزهٔ ملی (بدون استان روی کاربر)
    expect(
      roleHasReportAccess(matrix, 'central_organization', 'learners', [])
    ).toBe(true);

    expect(
      grantedReportSlugsForRole(matrix, 'mentor_teacher', ['p0'])
    ).toEqual(['learners', 'attendance']);
  });
});
