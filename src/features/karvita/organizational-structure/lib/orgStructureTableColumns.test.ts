import { describe, expect, it } from 'vitest';

import { getOrgStructureColumns } from './orgStructureTableColumns';

describe('getOrgStructureColumns — tab column order', () => {
  it('keeps provinces and cities in the existing order', () => {
    expect(getOrgStructureColumns('provinces').map((c) => c.key)).toEqual([
      'name',
      'campusesCount',
      'districtsCount',
      'schoolsCount',
      'usersCount',
      'actions',
    ]);
    expect(getOrgStructureColumns('cities').map((c) => c.key)).toEqual([
      'name',
      'provinceName',
      'schoolsCount',
      'usersCount',
      'actions',
    ]);
  });

  it('orders districts as name, province, city, schools, users, actions', () => {
    expect(getOrgStructureColumns('districts').map((c) => c.key)).toEqual([
      'name',
      'provinceName',
      'cityName',
      'schoolsCount',
      'usersCount',
      'actions',
    ]);
  });

  it('orders schools as name, gender, province, city, district, users, actions', () => {
    expect(getOrgStructureColumns('schools').map((c) => c.key)).toEqual([
      'name',
      'gender',
      'provinceName',
      'cityName',
      'districtName',
      'usersCount',
      'actions',
    ]);
  });

  it('orders faculties as name, province, users, actions', () => {
    expect(getOrgStructureColumns('faculties').map((c) => c.key)).toEqual([
      'name',
      'provinceName',
      'usersCount',
      'actions',
    ]);
    expect(getOrgStructureColumns('faculties')[0]?.label).toBe(
      'نام دانشکده یا پردیس'
    );
  });
});
