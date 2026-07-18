import { describe, expect, it } from 'vitest';

import {
  isCityDeleteBlocked,
  isDistrictDeleteBlocked,
  isOrgEntityDeleteBlocked,
  isProvinceDeleteBlocked,
} from '@/services/org-structure-delete-rules';
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
    expect(isProvinceDeleteBlocked(emptyDb, 'p1')).toBe(false);
    expect(isOrgEntityDeleteBlocked('province', emptyDb, 'p1')).toBe(false);
  });

  it('blocks province delete when cities/districts/schools reference it', () => {
    expect(isProvinceDeleteBlocked(linkedDb, 'p1')).toBe(true);
  });

  it('blocks city delete when districts or schools reference it', () => {
    expect(isCityDeleteBlocked(linkedDb, 'c1')).toBe(true);
  });

  it('blocks district delete when schools reference it', () => {
    expect(isDistrictDeleteBlocked(linkedDb, 'd1')).toBe(true);
  });

  it('allows school delete in current mock rules', () => {
    expect(isOrgEntityDeleteBlocked('school', linkedDb, 's1')).toBe(false);
  });
});
