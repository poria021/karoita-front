import { describe, expect, it } from 'vitest';

import {
  cityFormSchema,
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

  it('requires full school geo + gender', () => {
    const missing = schoolFormSchema.safeParse({
      name: 'مدرسه نمونه',
      provinceId: 'p1',
      cityId: 'c1',
      districtId: '',
      gender: 'male',
    });
    expect(missing.success).toBe(false);

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
