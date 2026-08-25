import { describe, expect, it } from 'vitest';

import {
  buildOrgDeleteBlockedSets,
  isDeleteBlockedWithSets,
  isOrgEntityDeleteBlocked,
} from '@/services/org-structure/mock/org-structure-delete-rules';
import type { OrgStructureSnapshot } from '@/types/org-structure';

const emptyDb: OrgStructureSnapshot = {
  provinces: [{ id: 'p1', name: 'تهران' }],
  cities: [],
  faculties: [],
  districts: [],
  schools: [],
  majors: [],
};

const linkedDb: OrgStructureSnapshot = {
  provinces: [{ id: 'p1', name: 'تهران' }],
  cities: [{ id: 'c1', name: 'تهران', provinceId: 'p1' }],
  faculties: [],
  districts: [{ id: 'd1', name: 'ناحیه ۱', provinceId: 'p1', cityId: 'c1' }],
  schools: [
    {
      id: 's1',
      name: 'البرز',
      provinceId: 'p1',
      cityId: 'c1',
      districtId: 'd1',
      gender: 'male',
    },
  ],
  majors: [],
};

describe('org-structure deleteBlocked rules', () => {
  it('allows delete when province has no children', () => {
    expect(isOrgEntityDeleteBlocked('province', emptyDb, 'p1')).toBe(false);
  });

  it('blocks province delete when cities/districts/schools reference it', () => {
    expect(isOrgEntityDeleteBlocked('province', linkedDb, 'p1')).toBe(true);
  });

  it('blocks city delete when districts or schools reference it', () => {
    expect(isOrgEntityDeleteBlocked('city', linkedDb, 'c1')).toBe(true);
  });

  it('blocks district delete when schools reference it', () => {
    expect(isOrgEntityDeleteBlocked('district', linkedDb, 'd1')).toBe(true);
  });

  it('allows school delete in current mock rules (leaf entity)', () => {
    expect(isOrgEntityDeleteBlocked('school', linkedDb, 's1')).toBe(false);
  });

  it('allows faculty/major delete — leaf entities with no dependents today', () => {
    expect(isOrgEntityDeleteBlocked('faculty', linkedDb, 'anything')).toBe(false);
    expect(isOrgEntityDeleteBlocked('major', linkedDb, 'anything')).toBe(false);
  });

  it('isDeleteBlockedWithSets + buildOrgDeleteBlockedSets: reuse sets across many ids', () => {
    const sets = buildOrgDeleteBlockedSets(linkedDb);
    expect(isDeleteBlockedWithSets('province', 'p1', sets)).toBe(true);
    expect(isDeleteBlockedWithSets('city', 'c1', sets)).toBe(true);
    expect(isDeleteBlockedWithSets('district', 'd1', sets)).toBe(true);
    expect(isDeleteBlockedWithSets('school', 's1', sets)).toBe(false);
  });
});
