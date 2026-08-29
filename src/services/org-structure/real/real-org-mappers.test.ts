import { describe, expect, it } from 'vitest';

import {
  firstRelationTitle,
  nestRelationFiltersIgnored,
  nestRelationId,
  nestRelationTitle,
  nestUsersCount,
  resolveRoleLabel,
  toOrgCity,
  toOrgDistrict,
  toOrgFaculty,
  toOrgMajorListItem,
  toOrgMajorListItemForRole,
  toOrgProvince,
  toOrgSchool,
} from '@/services/org-structure/real/real-org-mappers';

describe('nestRelationId / nestRelationTitle', () => {
  it('reads a plain string id and ignores blank strings', () => {
    expect(nestRelationId('c1')).toBe('c1');
    expect(nestRelationId('  ')).toBe('');
    expect(nestRelationId(undefined)).toBe('');
  });

  it('reads populated `{ id, title }` and `{ _id, name }` documents', () => {
    expect(nestRelationId({ id: 'c1', title: 'کاشان' })).toBe('c1');
    expect(nestRelationId({ _id: 'c1', name: 'کاشان' })).toBe('c1');
    expect(nestRelationTitle({ id: 'c1', title: 'کاشان' })).toBe('کاشان');
    expect(nestRelationTitle({ _id: 'c1', name: 'کاشان' })).toBe('کاشان');
  });

  it('treats empty title as absent so callers can fall through', () => {
    expect(nestRelationTitle({ id: 'c1', title: '  ' })).toBeUndefined();
    expect(nestRelationTitle({})).toBeUndefined();
  });

  it('picks the first populated title among candidates', () => {
    expect(firstRelationTitle({}, { id: 'c1', title: 'کاشان' })).toBe('کاشان');
    expect(firstRelationTitle('c1', { title: '' }, { name: 'قم' })).toBe('قم');
  });
});

describe('nestRelationFiltersIgnored', () => {
  it('treats the filter as ignored only when several catalog values each return the full list', () => {
    expect(nestRelationFiltersIgnored([2, 2, 2], 2)).toBe(true);
    expect(nestRelationFiltersIgnored([1, 0, 0], 2)).toBe(false);
  });

  it('keeps a real assignment when one district owns every school, including a 1-school list', () => {
    expect(nestRelationFiltersIgnored([2, 0, 0, 0], 2)).toBe(false);
    expect(nestRelationFiltersIgnored([1, 0, 0, 0, 0, 0], 1)).toBe(false);
  });
});

describe('toOrgProvince', () => {
  it('maps Nest Province → OrgProvince', () => {
    expect(toOrgProvince({ id: 'p1', title: 'تهران' })).toEqual({
      id: 'p1',
      name: 'تهران',
    });
  });
});

describe('toOrgCity — defensive province field resolution', () => {
  it('reads flat province_id when present', () => {
    expect(
      toOrgCity({ id: 'c1', title: 'کرج', province_id: 'p1' })
    ).toEqual({ id: 'c1', name: 'کرج', provinceId: 'p1' });
  });

  it('falls back to nested province.id when province_id is absent', () => {
    expect(
      toOrgCity({ id: 'c1', title: 'کرج', province: { id: 'p1' } })
    ).toEqual({ id: 'c1', name: 'کرج', provinceId: 'p1' });
  });

  it('prefers the flat field over the nested one when both are present', () => {
    expect(
      toOrgCity({
        id: 'c1',
        title: 'کرج',
        province_id: 'p1',
        province: { id: 'p2' },
      })
    ).toEqual({ id: 'c1', name: 'کرج', provinceId: 'p1' });
  });

  it('resolves to an empty provinceId when neither shape is present', () => {
    expect(toOrgCity({ id: 'c1', title: 'کرج' })).toEqual({
      id: 'c1',
      name: 'کرج',
      provinceId: '',
    });
  });

  it('treats an empty nested province object ({}) as absent', () => {
    expect(toOrgCity({ id: 'c1', title: 'کرج', province: {} })).toEqual({
      id: 'c1',
      name: 'کرج',
      provinceId: '',
    });
  });
});

describe('toOrgFaculty — defensive province/city field resolution', () => {
  it('reads flat provinceId/cityId when present', () => {
    expect(
      toOrgFaculty({
        id: 'f1',
        title: 'پردیس شهید بهشتی',
        provinceId: 'p1',
        cityId: 'c1',
      })
    ).toEqual({
      id: 'f1',
      name: 'پردیس شهید بهشتی',
      provinceId: 'p1',
      cityId: 'c1',
    });
  });

  it('falls back to nested province/city objects when flat ids are absent', () => {
    expect(
      toOrgFaculty({
        id: 'f1',
        title: 'پردیس شهید بهشتی',
        province: { id: 'p1' },
        city: { id: 'c1' },
      })
    ).toEqual({
      id: 'f1',
      name: 'پردیس شهید بهشتی',
      provinceId: 'p1',
      cityId: 'c1',
    });
  });

  it('resolves to empty ids when neither shape is present', () => {
    expect(
      toOrgFaculty({ id: 'f1', title: 'پردیس شهید بهشتی' })
    ).toEqual({
      id: 'f1',
      name: 'پردیس شهید بهشتی',
      provinceId: '',
      cityId: '',
    });
  });

  it('falls back to the confirmed live quirk (province nested under `role`) when `province` is absent', () => {
    expect(
      toOrgFaculty({
        id: 'f1',
        title: 'نسیبه',
        role: { id: 'p1', title: 'تهران' },
        city: { id: 'c1', title: 'کاشان' },
      })
    ).toEqual({ id: 'f1', name: 'نسیبه', provinceId: 'p1', cityId: 'c1' });
  });

  it('prefers a correctly-named `province` over the `role` quirk if both are present', () => {
    expect(
      toOrgFaculty({
        id: 'f1',
        title: 'نسیبه',
        province: { id: 'p1' },
        role: { id: 'p2' },
      })
    ).toEqual({ id: 'f1', name: 'نسیبه', provinceId: 'p1', cityId: '' });
  });

  it('extracts a string cityId when GET populates the city onto the FK field', () => {
    expect(
      toOrgFaculty({
        id: 'f1',
        title: 'نسیبه',
        role: { id: 'p1', title: 'تهران' },
        cityId: { id: 'c1', title: 'کاشان' },
        city: {},
      })
    ).toEqual({ id: 'f1', name: 'نسیبه', provinceId: 'p1', cityId: 'c1' });
  });
});

describe('toOrgDistrict — defensive province/city field resolution', () => {
  it('reads flat provinceId/cityId (create/update DTO shape)', () => {
    expect(
      toOrgDistrict({
        id: 'd1',
        title: 'ناحیه ۱',
        provinceId: 'p1',
        cityId: 'c1',
      })
    ).toEqual({ id: 'd1', name: 'ناحیه ۱', provinceId: 'p1', cityId: 'c1' });
  });

  it('falls back to snake_case province_id/city_id', () => {
    expect(
      toOrgDistrict({
        id: 'd1',
        title: 'ناحیه ۱',
        province_id: 'p1',
        city_id: 'c1',
      })
    ).toEqual({ id: 'd1', name: 'ناحیه ۱', provinceId: 'p1', cityId: 'c1' });
  });

  it('falls back to nested province/city objects last', () => {
    expect(
      toOrgDistrict({
        id: 'd1',
        title: 'ناحیه ۱',
        province: { id: 'p1' },
        city: { id: 'c1' },
      })
    ).toEqual({ id: 'd1', name: 'ناحیه ۱', provinceId: 'p1', cityId: 'c1' });
  });

  it('resolves to empty ids when no shape is present', () => {
    expect(toOrgDistrict({ id: 'd1', title: 'ناحیه ۱' })).toEqual({
      id: 'd1',
      name: 'ناحیه ۱',
      provinceId: '',
      cityId: '',
    });
  });
});

describe('toOrgSchool — defensive field resolution + gender normalization', () => {
  it('reads flat provinceId/cityId/educationId', () => {
    expect(
      toOrgSchool({
        id: 's1',
        title: 'دبیرستان البرز',
        provinceId: 'p1',
        cityId: 'c1',
        educationId: 'd1',
        gender: 'Boy',
      })
    ).toEqual({
      id: 's1',
      name: 'دبیرستان البرز',
      provinceId: 'p1',
      cityId: 'c1',
      districtId: 'd1',
      gender: 'male',
    });
  });

  it('falls back through snake_case then nested objects', () => {
    expect(
      toOrgSchool({
        id: 's1',
        title: 'دبیرستان البرز',
        province_id: 'p1',
        city_id: 'c1',
        education_id: 'd1',
        gender: 'Girl',
      })
    ).toEqual({
      id: 's1',
      name: 'دبیرستان البرز',
      provinceId: 'p1',
      cityId: 'c1',
      districtId: 'd1',
      gender: 'female',
    });

    expect(
      toOrgSchool({
        id: 's1',
        title: 'دبیرستان البرز',
        province: { id: 'p1' },
        city: { id: 'c1' },
        education: { id: 'd1' },
      })
    ).toEqual({
      id: 's1',
      name: 'دبیرستان البرز',
      provinceId: 'p1',
      cityId: 'c1',
      districtId: 'd1',
      gender: 'male',
    });
  });

  it('normalizes gender case-insensitively, defaulting to male when unrecognized', () => {
    expect(
      toOrgSchool({ id: 's1', title: 'x', gender: 'FEMALE' }).gender
    ).toBe('female');
    expect(
      toOrgSchool({ id: 's1', title: 'x', gender: 'unknown-value' }).gender
    ).toBe('male');
    expect(toOrgSchool({ id: 's1', title: 'x' }).gender).toBe('male');
  });

  it('prefers the confirmed live `genderType` field over `gender`', () => {
    expect(
      toOrgSchool({ id: 's1', title: 'x', genderType: 'Girl', gender: 'Boy' })
        .gender
    ).toBe('female');
    expect(
      toOrgSchool({ id: 's1', title: 'x', genderType: 'Boy' }).gender
    ).toBe('male');
  });

  it('extracts a string districtId when GET populates education onto the FK field', () => {
    expect(
      toOrgSchool({
        id: 's1',
        title: 'دبیرستان البرز',
        educationId: { id: 'd1', title: 'ناحیه ۱' },
        education: {},
      })
    ).toEqual({
      id: 's1',
      name: 'دبیرستان البرز',
      provinceId: '',
      cityId: '',
      districtId: 'd1',
      gender: 'male',
    });
  });
});

describe('nestUsersCount', () => {
  it('prefers usersCount then users_count then users array length', () => {
    expect(nestUsersCount({ usersCount: 3 })).toBe(3);
    expect(nestUsersCount({ users_count: 2 })).toBe(2);
    expect(nestUsersCount({ users: [{}, {}] })).toBe(2);
    expect(nestUsersCount({})).toBeUndefined();
  });
});

describe('toOrgMajorListItem', () => {
  it('maps a degree with a flat roleId', () => {
    expect(
      toOrgMajorListItem({ id: 'm1', title: 'ریاضی', roleId: 'r1' })
    ).toEqual({
      id: 'm1',
      name: 'ریاضی',
      kind: 'major',
      deleteBlocked: false,
      usersCount: undefined,
      roleName: undefined,
      roleId: 'r1',
    });
  });

  it('falls back to the nested role object for both id and display name', () => {
    expect(
      toOrgMajorListItem({
        id: 'm1',
        title: 'ریاضی',
        role: { id: 'r1', title: 'دانش‌آموز' },
        usersCount: 4,
      })
    ).toEqual({
      id: 'm1',
      name: 'ریاضی',
      kind: 'major',
      deleteBlocked: true,
      usersCount: 4,
      roleName: 'دانش‌آموز',
      roleId: 'r1',
    });
  });
});

describe('toOrgMajorListItemForRole', () => {
  it('attaches the already-known roleId (row itself carries no role field)', () => {
    expect(
      toOrgMajorListItemForRole({ id: 'm1', title: 'ریاضی' }, 'r1')
    ).toEqual({
      id: 'm1',
      name: 'ریاضی',
      kind: 'major',
      deleteBlocked: false,
      usersCount: undefined,
      roleId: 'r1',
    });
  });
});

describe('resolveRoleLabel', () => {
  it('prefers title_fa over title when both are present', () => {
    expect(
      resolveRoleLabel({
        id: 'abcdef123456',
        title: 'trainee',
        title_fa: 'کارآموز',
      })
    ).toBe('کارآموز');
  });

  it('uses the title when present', () => {
    expect(resolveRoleLabel({ id: 'abcdef123456', title: 'دانش‌آموز' })).toBe(
      'دانش‌آموز'
    );
  });

  it('falls back to a short id-based label when title is missing', () => {
    expect(resolveRoleLabel({ id: 'abcdef123456' })).toBe(
      // Not a color — id-based label built by resolveRoleLabel(), see real-org-mappers.ts
      // eslint-disable-next-line no-restricted-syntax
      'نقش #123456'
    );
  });

  it('falls back when title is blank/whitespace-only', () => {
    expect(resolveRoleLabel({ id: 'abcdef123456', title: '   ' })).toBe(
      // Not a color — id-based label built by resolveRoleLabel(), see real-org-mappers.ts
      // eslint-disable-next-line no-restricted-syntax
      'نقش #123456'
    );
  });
});
