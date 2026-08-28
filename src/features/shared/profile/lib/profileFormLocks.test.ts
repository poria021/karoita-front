import { describe, expect, it } from 'vitest';

import { getProfileFormLocks } from './profileFormLocks';

describe('getProfileFormLocks', () => {
  it('keeps the full form editable before submit and after rejection', () => {
    for (const docStatus of ['not_submitted', 'rejected'] as const) {
      const locks = getProfileFormLocks({
        disabled: false,
        autoApproveOnSave: false,
        docStatus,
      });
      expect(locks.identityLocked).toBe(false);
      expect(locks.organizationLocked).toBe(false);
      expect(locks.submitLocked).toBe(false);
    }
  });

  it('locks everything while the file is waiting for senior-admin review', () => {
    const locks = getProfileFormLocks({
      disabled: false,
      autoApproveOnSave: false,
      docStatus: 'pending_admin',
    });
    expect(locks.awaitingAdminReview).toBe(true);
    expect(locks.identityLocked).toBe(true);
    expect(locks.organizationLocked).toBe(true);
    expect(locks.submitLocked).toBe(true);
  });

  it('keeps org fields editable after the account is approved', () => {
    const locks = getProfileFormLocks({
      disabled: false,
      autoApproveOnSave: false,
      docStatus: 'approved',
      hasUnsavedChanges: true,
    });
    expect(locks.accountApproved).toBe(true);
    expect(locks.identityLocked).toBe(true);
    expect(locks.organizationLocked).toBe(false);
    expect(locks.submitLocked).toBe(false);
  });

  it('locks submit after approval until the user changes a field', () => {
    const pristine = getProfileFormLocks({
      disabled: false,
      autoApproveOnSave: false,
      docStatus: 'approved',
      hasUnsavedChanges: false,
    });
    expect(pristine.submitLocked).toBe(true);
    expect(pristine.organizationLocked).toBe(false);
  });
});
