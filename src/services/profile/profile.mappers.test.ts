import { describe, expect, it } from 'vitest';

import {
  extractApiMessage,
  extractApiPayload,
  mergeRecordIntoUser,
  parseProfile,
  ProfileServiceError,
} from '@/services/profile/profile.mappers';
import type { User } from '@/types/auth';

const studentProfile = {
  role: 'student' as const,
  firstName: 'امیرحسین',
  lastName: 'کریمی',
  province: 'تهران',
  college: 'پردیس شهید باهنر تهران',
  major: 'آموزش ابتدایی',
  studentId: '1234',
};

function baseUser(): User {
  return {
    id: 'u1',
    firstName: 'قدیمی',
    lastName: 'کاربر',
    mobile: '9120000000',
    role: 'student',
    approved: false,
    docStatus: 'pending_admin',
    province: ['اصفهان'],
  };
}

describe('profile Nest mappers', () => {
  it('parses a valid Nest-shaped profile and rejects an incomplete one', () => {
    expect(parseProfile(studentProfile)).toMatchObject({
      role: 'student',
      firstName: 'امیرحسین',
    });
    expect(() => parseProfile({ role: 'student', firstName: 'امیر' })).toThrow(
      ProfileServiceError
    );
  });

  it('unwraps { data } envelopes and joins Nest message arrays', () => {
    expect(extractApiPayload({ data: studentProfile })).toEqual(studentProfile);
    expect(extractApiPayload(studentProfile)).toEqual(studentProfile);
    expect(extractApiMessage({ message: 'خطای تکی' })).toBe('خطای تکی');
    expect(extractApiMessage({ message: ['اول', 'دوم'] })).toBe('اول، دوم');
    expect(extractApiMessage({ error: 'fallback' })).toBe('fallback');
  });

  it('merges only recognized Nest fields onto the session user', () => {
    const merged = mergeRecordIntoUser(baseUser(), {
      firstName: 'جدید',
      approved: true,
      docStatus: 'approved',
      province: ['تهران', 'البرز'],
      unknown: 'drop-me',
    });
    expect(merged.firstName).toBe('جدید');
    expect(merged.approved).toBe(true);
    expect(merged.docStatus).toBe('approved');
    expect(merged.province).toEqual(['تهران', 'البرز']);
    expect(merged.mobile).toBe('9120000000');
  });
});
