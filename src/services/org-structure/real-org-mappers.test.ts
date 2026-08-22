import { describe, expect, it } from 'vitest';

import {
  resolveRoleLabel,
  toOrgCity,
  toOrgDistrict,
  toOrgFaculty,
  toOrgMajorListItem,
  toOrgMajorListItemForRole,
  toOrgProvince,
  toOrgSchool,
} from '@/services/org-structure/real-org-mappers';

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
      })
    ).toEqual({
      id: 'm1',
      name: 'ریاضی',
      kind: 'major',
      deleteBlocked: false,
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
      roleId: 'r1',
    });
  });
});

describe('resolveRoleLabel', () => {
  it('uses the title when present', () => {
    expect(resolveRoleLabel({ id: 'abcdef123456', title: 'دانش‌آموز' })).toBe(
      'دانش‌آموز'
    );
  });

  it('falls back to a short id-based label when title is missing', () => {
    expect(resolveRoleLabel({ id: 'abcdef123456' })).toBe('نقش #123456');
  });

  it('falls back when title is blank/whitespace-only', () => {
    expect(resolveRoleLabel({ id: 'abcdef123456', title: '   ' })).toBe(
      'نقش #123456'
    );
  });
});
