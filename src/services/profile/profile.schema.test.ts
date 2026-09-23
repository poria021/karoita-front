import { describe, expect, it } from 'vitest';

import { createProfileSchema } from '@/services/profile/profile.schema';
import { PERSIAN_PERSON_NAME_INVALID_MESSAGE } from '@/utils/persianPersonName';

describe('createProfileSchema name fields', () => {
  const schema = createProfileSchema('student');

  const base = {
    role: 'student' as const,
    firstName: 'امیرحسین',
    lastName: 'کریمی',
    province: 'تهران',
    college: 'پردیس شهید باهنر تهران',
    major: 'آموزش ابتدایی',
    studentId: '1234',
  };

  it('accepts Persian first and last name', () => {
    expect(schema.safeParse(base).success).toBe(true);
  });

  it('rejects Latin letters in firstName', () => {
    const result = schema.safeParse({ ...base, firstName: 'Amir' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        PERSIAN_PERSON_NAME_INVALID_MESSAGE
      );
    }
  });

  it('rejects mixed Persian/Latin lastName', () => {
    const result = schema.safeParse({
      ...base,
      lastName: 'کریمی Karimi',
    });
    expect(result.success).toBe(false);
  });
});
