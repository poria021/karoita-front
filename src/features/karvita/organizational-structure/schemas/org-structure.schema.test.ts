import { describe, expect, it } from 'vitest';

import {
  cityFormSchema,
  districtFormSchema,
  facultyFormSchema,
  majorFormSchema,
  provinceFormSchema,
  schoolFormSchema,
} from './org-structure.schema';

describe('org-structure form schemas', () => {
  it('accepts a valid province name', () => {
    expect(provinceFormSchema.safeParse({ name: 'تهران' }).success).toBe(true);
  });

  it('rejects empty or too-short names', () => {
    expect(provinceFormSchema.safeParse({ name: '' }).success).toBe(false);
    expect(provinceFormSchema.safeParse({ name: 'ا' }).success).toBe(false);
  });

  it('requires provinceId for city', () => {
    expect(
      cityFormSchema.safeParse({ name: 'کرج', provinceId: '' }).success
    ).toBe(false);
    expect(
      cityFormSchema.safeParse({ name: 'کرج', provinceId: 'p1' }).success
    ).toBe(true);
  });

  it('requires province for a district; city is optional', () => {
    expect(
      districtFormSchema.safeParse({ name: 'ناحیه ۱', provinceId: '' }).success
    ).toBe(false);
    expect(
      districtFormSchema.safeParse({ name: 'ناحیه ۱', provinceId: 'p1' }).success
    ).toBe(true);
    expect(
      districtFormSchema.safeParse({
        name: 'ناحیه ۱',
        provinceId: 'p1',
        cityId: 'c1',
      }).success
    ).toBe(true);
  });

  it('requires faculty province; city is optional', () => {
    expect(
      facultyFormSchema.safeParse({ name: 'پردیس مرکزی', provinceId: '' })
        .success
    ).toBe(false);
    expect(
      facultyFormSchema.safeParse({ name: 'پردیس مرکزی', provinceId: 'p1' })
        .success
    ).toBe(true);
    expect(
      facultyFormSchema.safeParse({
        name: 'پردیس مرکزی',
        provinceId: 'p1',
        cityId: 'c1',
      }).success
    ).toBe(true);
  });

  it('requires school province and gender; city and district are optional', () => {
    const missingProvince = schoolFormSchema.safeParse({
      name: 'مدرسه نمونه',
      provinceId: '',
      gender: 'male',
    });
    expect(missingProvince.success).toBe(false);

    const withoutCity = schoolFormSchema.safeParse({
      name: 'مدرسه نمونه',
      provinceId: 'p1',
      cityId: '',
      gender: 'male',
    });
    expect(withoutCity.success).toBe(true);

    const withoutDistrict = schoolFormSchema.safeParse({
      name: 'مدرسه نمونه',
      provinceId: 'p1',
      cityId: 'c1',
      districtId: '',
      gender: 'male',
    });
    expect(withoutDistrict.success).toBe(true);

    const ok = schoolFormSchema.safeParse({
      name: 'مدرسه نمونه',
      provinceId: 'p1',
      cityId: 'c1',
      districtId: 'd1',
      gender: 'female',
    });
    expect(ok.success).toBe(true);
  });

  it('requires major audience', () => {
    expect(majorFormSchema.safeParse({ name: 'علوم تربیتی' }).success).toBe(
      false
    );
    expect(
      majorFormSchema.safeParse({
        name: 'علوم تربیتی',
        audience: 'student',
      }).success
    ).toBe(true);
    expect(
      majorFormSchema.safeParse({
        name: 'الکترونیک صنعتی',
        audience: 'skill_learner',
      }).success
    ).toBe(true);
  });
});
