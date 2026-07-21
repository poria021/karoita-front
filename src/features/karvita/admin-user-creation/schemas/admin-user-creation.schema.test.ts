import { describe, expect, it } from 'vitest';

import { adminUserCreationSchema } from './admin-user-creation.schema';

describe('adminUserCreationSchema', () => {
  const base = {
    firstName: 'علی',
    lastName: 'رضایی',
    mobile: '9123456780',
    password: '1234',
  };

  it('accepts central_organization without geo fields', () => {
    const result = adminUserCreationSchema.safeParse({
      ...base,
      role: 'central_organization',
      province: '',
      city: '',
      college: '',
      district: '',
    });
    expect(result.success).toBe(true);
  });

  it('requires province for provincial_university', () => {
    const result = adminUserCreationSchema.safeParse({
      ...base,
      role: 'provincial_university',
      province: '',
      city: '',
      college: '',
      district: '',
    });
    expect(result.success).toBe(false);
  });

  it('requires province + college for faculty_role', () => {
    const missingCollege = adminUserCreationSchema.safeParse({
      ...base,
      role: 'faculty_role',
      province: 'تهران',
      city: '',
      college: '',
      district: '',
    });
    expect(missingCollege.success).toBe(false);

    const ok = adminUserCreationSchema.safeParse({
      ...base,
      role: 'faculty_role',
      province: 'تهران',
      city: '',
      college: 'پردیس شهید باهنر تهران',
      district: '',
    });
    expect(ok.success).toBe(true);
  });

  it('requires province + city + district for regional_edu_admin', () => {
    const result = adminUserCreationSchema.safeParse({
      ...base,
      role: 'regional_edu_admin',
      province: 'تهران',
      city: 'تهران',
      college: '',
      district: '',
    });
    expect(result.success).toBe(false);
  });

  it('normalizes Persian mobile digits to English', () => {
    const result = adminUserCreationSchema.safeParse({
      ...base,
      mobile: '۹۱۲۳۴۵۶۷۸۰',
      role: 'assistant_admin',
      province: '',
      city: '',
      college: '',
      district: '',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mobile).toBe('9123456780');
    }
  });
});
