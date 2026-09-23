import { describe, expect, it } from 'vitest';

import {
  IRAN_MOBILE_INPUT_PATTERN,
  IRAN_MOBILE_PATTERN,
  iranMobileFieldSchema,
  sanitizeIranMobileNationalInput,
} from '@/utils/iranMobileField';

describe('iranMobileFieldSchema', () => {
  it('accepts a 10-digit national number and Persian digits', () => {
    expect(iranMobileFieldSchema.parse('9123456789')).toBe('9123456789');
    expect(iranMobileFieldSchema.parse('۹۱۲۳۴۵۶۷۸۹')).toBe('9123456789');
  });

  it('rejects a leading zero, separators, and short values', () => {
    expect(iranMobileFieldSchema.safeParse('09123456789').success).toBe(false);
    expect(iranMobileFieldSchema.safeParse('912-345-6789').success).toBe(false);
    expect(iranMobileFieldSchema.safeParse('912345678').success).toBe(false);
    expect(iranMobileFieldSchema.safeParse('').success).toBe(false);
  });
});

describe('sanitizeIranMobileNationalInput', () => {
  it('strips a leading zero and keeps a national number starting with 9', () => {
    expect(sanitizeIranMobileNationalInput('۰۹۱۲۳۴۵۶۷۸۹')).toBe('9123456789');
    expect(sanitizeIranMobileNationalInput('09123456789')).toBe('9123456789');
    expect(sanitizeIranMobileNationalInput('0')).toBe('');
    expect(sanitizeIranMobileNationalInput('8')).toBe('');
    expect(sanitizeIranMobileNationalInput('912')).toBe('912');
  });

  it('matches the shared national regexes', () => {
    expect(IRAN_MOBILE_PATTERN.test('9123456789')).toBe(true);
    expect(IRAN_MOBILE_PATTERN.test('09123456789')).toBe(false);
    expect(IRAN_MOBILE_INPUT_PATTERN.test('9')).toBe(true);
    expect(IRAN_MOBILE_INPUT_PATTERN.test('09')).toBe(false);
  });
});
