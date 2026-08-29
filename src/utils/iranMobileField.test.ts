import { describe, expect, it } from 'vitest';

import { iranMobileFieldSchema } from '@/utils/iranMobileField';

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
