import { describe, expect, it } from 'vitest';

import {
  firstRelationTitle,
  nestCatalogCount,
  nestRelationFiltersIgnored,
  nestRelationId,
  nestRelationTitle,
  nestUsersCount,
  resolveRoleLabel,
  toOrgCity,
  toOrgCityListItem,
  toOrgDistrict,
  toOrgDistrictListItem,
  toOrgFaculty,
  toOrgMajorListItem,
  toOrgMajorListItemForRole,
  toOrgProvince,
  toOrgProvinceListItem,
  toOrgSchool,
  toOrgSchoolListItem,
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
  it('prefers usersCount then live userCount then users_count then users array length', () => {
    expect(nestUsersCount({ usersCount: 3 })).toBe(3);
    expect(nestUsersCount({ userCount: 5 })).toBe(5);
    expect(nestUsersCount({ users_count: 2 })).toBe(2);
    expect(nestUsersCount({ users: [{}, {}] })).toBe(2);
    expect(nestUsersCount({})).toBeUndefined();
  });
});

describe('nestCatalogCount', () => {
  it('picks the first finite non-negative count', () => {
    expect(nestCatalogCount(undefined, 19, 0)).toBe(19);
    expect(nestCatalogCount(0, 3)).toBe(0);
    expect(nestCatalogCount()).toBeUndefined();
  });
});

describe('toOrgProvinceListItem — live GET /admin/provinces counts', () => {
  it('maps university/district/school/user counts onto table columns', () => {
    expect(
      toOrgProvinceListItem({
        id: '6a8fbd899dd4b76b91bbd7a5',
        title: 'سیشبسب',
        universityCount: 19,
        educationalDistrictCount: 6,
        schoolCount: 3,
        userCount: 1,
      })
    ).toEqual({
      id: '6a8fbd899dd4b76b91bbd7a5',
      name: 'سیشبسب',
      kind: 'province',
      campusesCount: 19,
      districtsCount: 6,
      schoolsCount: 3,
      usersCount: 1,
      deleteBlocked: true,
    });
  });
});

describe('toOrgCityListItem — live GET /admin/cities counts', () => {
  it('maps nested province title plus school/user counts', () => {
    expect(
      toOrgCityListItem({
        id: '6a8fcb3a9dd4b76b91bbd7b8',
        title: 'سشبسی',
        province: { id: '6a8fbd899dd4b76b91bbd7a5', title: 'سیشبسب' },
        schoolCount: 3,
        userCount: 0,
      })
    ).toEqual({
      id: '6a8fcb3a9dd4b76b91bbd7b8',
      name: 'سشبسی',
      kind: 'city',
      provinceId: '6a8fbd899dd4b76b91bbd7a5',
      provinceName: 'سیشبسب',
      schoolsCount: 3,
      usersCount: 0,
      deleteBlocked: true,
    });
  });
});

describe('toOrgDistrictListItem — live GET /admin/educations counts', () => {
  it('maps nested province/city titles plus school/user counts', () => {
    expect(
      toOrgDistrictListItem({
        id: '6a8fc3cb9dd4b76b91bbd7b2',
        title: 'سیبسیش',
        province: { id: '6a8fbd899dd4b76b91bbd7a5', title: 'سیشبسب' },
        city: { id: '6a8fcb3a9dd4b76b91bbd7b8', title: 'سشبسی' },
        schoolCount: 3,
        userCount: 0,
      })
    ).toEqual({
      id: '6a8fc3cb9dd4b76b91bbd7b2',
      name: 'سیبسیش',
      kind: 'district',
      provinceId: '6a8fbd899dd4b76b91bbd7a5',
      cityId: '6a8fcb3a9dd4b76b91bbd7b8',
      provinceName: 'سیشبسب',
      cityName: 'سشبسی',
      schoolsCount: 3,
      usersCount: 0,
      deleteBlocked: true,
    });
  });
});

describe('toOrgSchoolListItem — live GET /admin/schools row', () => {
  it('maps populated education and live userCount', () => {
    expect(
      toOrgSchoolListItem({
        id: '6a8fc4009dd4b76b91bbd7b6',
        title: 'لیبلسب',
        genderType: 'Boy',
        province: { id: '6a8fbd899dd4b76b91bbd7a5', title: 'سیشبسب' },
        city: { id: '6a8fcb3a9dd4b76b91bbd7b8', title: 'سشبسی' },
        education: { id: '6a8fc3cb9dd4b76b91bbd7b2', title: 'سیبسیش' },
        userCount: 0,
      })
    ).toEqual({
      id: '6a8fc4009dd4b76b91bbd7b6',
      name: 'لیبلسب',
      kind: 'school',
      gender: 'male',
      provinceId: '6a8fbd899dd4b76b91bbd7a5',
      cityId: '6a8fcb3a9dd4b76b91bbd7b8',
      districtId: '6a8fc3cb9dd4b76b91bbd7b2',
      provinceName: 'سیشبسب',
      cityName: 'سشبسی',
      districtName: 'سیبسیش',
      usersCount: 0,
      deleteBlocked: false,
    });
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

  it('maps the live degreeee join (role.id + English role.title)', () => {
    expect(
      toOrgMajorListItem({
        id: '6a8fae999dd4b76b91bbd789',
        title: 'مهندسی معدن',
        role: { id: '6a895cc8864f70463b97c17e', title: 'teacher' },
      })
    ).toEqual({
      id: '6a8fae999dd4b76b91bbd789',
      name: 'مهندسی معدن',
      kind: 'major',
      deleteBlocked: false,
      usersCount: undefined,
      roleName: 'teacher',
      roleId: '6a895cc8864f70463b97c17e',
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
      // رنگ نیست — برچسب مبتنی بر id از resolveRoleLabel().
      // eslint-disable-next-line no-restricted-syntax
      'نقش #123456'
    );
  });

  it('falls back when title is blank/whitespace-only', () => {
    expect(resolveRoleLabel({ id: 'abcdef123456', title: '   ' })).toBe(
      // رنگ نیست — برچسب مبتنی بر id از resolveRoleLabel().
      // eslint-disable-next-line no-restricted-syntax
      'نقش #123456'
    );
  });
});
