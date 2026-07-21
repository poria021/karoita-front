import { describe, expect, it } from 'vitest';

import { rejectReasonSchema } from './reject-reason.schema';

describe('rejectReasonSchema', () => {
  it('accepts a non-empty trimmed reason', () => {
    const parsed = rejectReasonSchema.safeParse({
      reason: '  مدارک ناقص است  ',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.reason).toBe('مدارک ناقص است');
    }
  });

  it('rejects empty or whitespace-only reason', () => {
    expect(rejectReasonSchema.safeParse({ reason: '' }).success).toBe(false);
    expect(rejectReasonSchema.safeParse({ reason: '   ' }).success).toBe(false);
  });
});
