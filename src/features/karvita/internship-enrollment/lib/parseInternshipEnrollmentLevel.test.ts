import { describe, expect, it } from 'vitest';

import { parseInternshipEnrollmentLevel } from '@/features/karvita/internship-enrollment/lib/parseInternshipEnrollmentLevel';

describe('parseInternshipEnrollmentLevel', () => {
  it('accepts levels 1–4', () => {
    expect(parseInternshipEnrollmentLevel('1')).toBe(1);
    expect(parseInternshipEnrollmentLevel('4')).toBe(4);
  });

  it('rejects invalid segments', () => {
    expect(parseInternshipEnrollmentLevel('0')).toBeNull();
    expect(parseInternshipEnrollmentLevel('5')).toBeNull();
    expect(parseInternshipEnrollmentLevel('foo')).toBeNull();
  });
});
