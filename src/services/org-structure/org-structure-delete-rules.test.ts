import { describe, expect, it } from 'vitest';

import {
  buildOrgDeleteBlockedSets,
  isDeleteBlockedWithSets,
  isLinkedUserDeleteBlocked,
  isOrgEntityDeleteBlocked,
  orgDeleteBlockedMessage,
  orgTabNeedsDeleteBlockedIndex,
  withDeleteBlocked,
} from '@/services/org-structure/org-structure-delete-rules';
import type { OrgStructureListItem, OrgStructureSnapshot } from '@/types/org-structure';

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

  it('allows faculty/major delete when no users are linked (tree rules ignore them)', () => {
    expect(isOrgEntityDeleteBlocked('faculty', linkedDb, 'anything')).toBe(false);
    expect(isOrgEntityDeleteBlocked('major', linkedDb, 'anything')).toBe(false);
  });

  it('blocks province when a faculty is the only child, but not the city', () => {
    const withFaculty: OrgStructureSnapshot = {
      ...emptyDb,
      faculties: [
        { id: 'f1', name: 'پردیس', provinceId: 'p1', cityId: 'c9' },
      ],
    };
    expect(isOrgEntityDeleteBlocked('province', withFaculty, 'p1')).toBe(true);
    expect(isOrgEntityDeleteBlocked('city', withFaculty, 'c9')).toBe(false);
  });

  it('ignores empty Nest FKs so a blank cityId cannot block an unrelated row', () => {
    const withBlankFk: OrgStructureSnapshot = {
      ...emptyDb,
      schools: [
        {
          id: 's1',
          name: 'بی‌ارتباط',
          provinceId: '',
          cityId: '',
          districtId: '',
          gender: 'male',
        },
      ],
    };
    expect(isOrgEntityDeleteBlocked('province', withBlankFk, 'p1')).toBe(false);
    expect(isOrgEntityDeleteBlocked('city', withBlankFk, 'c1')).toBe(false);
  });

  it('isDeleteBlockedWithSets + buildOrgDeleteBlockedSets: reuse sets across many ids', () => {
    const sets = buildOrgDeleteBlockedSets(linkedDb);
    expect(isDeleteBlockedWithSets('province', 'p1', sets)).toBe(true);
    expect(isDeleteBlockedWithSets('city', 'c1', sets)).toBe(true);
    expect(isDeleteBlockedWithSets('district', 'd1', sets)).toBe(true);
    expect(isDeleteBlockedWithSets('school', 's1', sets)).toBe(false);
  });

  it('withDeleteBlocked stamps only parent rows on a mixed page', () => {
    const sets = buildOrgDeleteBlockedSets(linkedDb);
    const items: OrgStructureListItem[] = [
      { id: 'p1', name: 'تهران', kind: 'province', deleteBlocked: false },
      { id: 'p-free', name: 'ایلام', kind: 'province', deleteBlocked: false },
    ];
    expect(withDeleteBlocked(items, sets).map((row) => row.deleteBlocked)).toEqual(
      [true, false]
    );
  });

  it('orgDeleteBlockedMessage covers the parent kinds the UI can lock', () => {
    expect(orgDeleteBlockedMessage('province')).toMatch(/استان/);
    expect(orgDeleteBlockedMessage('city')).toMatch(/شهر/);
    expect(orgDeleteBlockedMessage('district')).toMatch(/منطقه/);
    expect(orgDeleteBlockedMessage('major')).toMatch(/رشته/);
    expect(orgDeleteBlockedMessage('faculty')).toMatch(/دانشکده/);
  });

  it('locks faculty/major when usersCount is positive', () => {
    expect(isLinkedUserDeleteBlocked('faculty', 1)).toBe(true);
    expect(isLinkedUserDeleteBlocked('major', 2)).toBe(true);
    expect(isLinkedUserDeleteBlocked('faculty', 0)).toBe(false);
    expect(isLinkedUserDeleteBlocked('city', 9)).toBe(false);
  });

  it('only parent list tabs pay for the child-catalog index', () => {
    expect(orgTabNeedsDeleteBlockedIndex('provinces')).toBe(true);
    expect(orgTabNeedsDeleteBlockedIndex('cities')).toBe(true);
    expect(orgTabNeedsDeleteBlockedIndex('districts')).toBe(true);
    expect(orgTabNeedsDeleteBlockedIndex('schools')).toBe(false);
    expect(orgTabNeedsDeleteBlockedIndex('faculties')).toBe(false);
    expect(orgTabNeedsDeleteBlockedIndex('majors')).toBe(false);
  });
});
