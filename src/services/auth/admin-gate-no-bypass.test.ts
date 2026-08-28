import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../..');

const BYPASS_IDENTIFIERS =
  /devAdminGateBypassLogin|isDevAdminGateBypassEnabled|DEV_ADMIN_GATE_BYPASS|dev-admin-gate-bypass/;

function readRepoFile(relativePath: string): string {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('admin-gate OTP bypass must not ship', () => {
  it('does not keep a bypass module (real-mode backdoor)', () => {
    expect(
      existsSync(
        path.join(repoRoot, 'src/services/auth/mock/dev-admin-gate-bypass.ts')
      )
    ).toBe(false);
    expect(
      existsSync(path.join(repoRoot, 'src/services/auth/dev-admin-gate-bypass.ts'))
    ).toBe(false);
  });

  it('does not document or flag a client OTP bypass', () => {
    expect(readRepoFile('.env.example')).not.toMatch(BYPASS_IDENTIFIERS);
    expect(readRepoFile('src/services/auth.service.ts')).not.toMatch(
      BYPASS_IDENTIFIERS
    );
    expect(
      readRepoFile('src/features/shared/auth/hooks/useAdminGate.ts')
    ).not.toMatch(BYPASS_IDENTIFIERS);
  });

  it('sends real-mode admin OTP verify to Nest after rejecting the mock secret', () => {
    const source = readRepoFile('src/services/auth.service.ts');
    expect(source).toContain('rejectMockOtpInReal(otp)');
    expect(source).toContain('return realVerifyAdminGateOtp(mobile, otp)');
    expect(source).not.toMatch(/fabricat|bypassLogin|skip.*[Oo]tp/);
  });
});
