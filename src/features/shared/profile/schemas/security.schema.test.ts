import { describe, expect, it } from 'vitest';

import {
  securityChangePasswordSchema,
  securityPasswordSchema,
} from './security.schema';

describe('securityPasswordSchema', () => {
  it('accepts matching latin passwords', () => {
    const result = securityPasswordSchema.safeParse({
      newPassword: 'newPass12',
      confirmPassword: 'newPass12',
    });
    expect(result.success).toBe(true);
  });

  it('rejects mismatched confirmation', () => {
    const result = securityPasswordSchema.safeParse({
      newPassword: 'newPass12',
      confirmPassword: 'otherPass',
    });
    expect(result.success).toBe(false);
  });
});

describe('securityChangePasswordSchema', () => {
  it('requires the current password and a different new password', () => {
    const ok = securityChangePasswordSchema.safeParse({
      oldPassword: '12345678',
      newPassword: 'newPass12',
      confirmPassword: 'newPass12',
    });
    expect(ok.success).toBe(true);

    const sameAsOld = securityChangePasswordSchema.safeParse({
      oldPassword: 'newPass12',
      newPassword: 'newPass12',
      confirmPassword: 'newPass12',
    });
    expect(sameAsOld.success).toBe(false);

    const missingOld = securityChangePasswordSchema.safeParse({
      oldPassword: '',
      newPassword: 'newPass12',
      confirmPassword: 'newPass12',
    });
    expect(missingOld.success).toBe(false);
  });
});
