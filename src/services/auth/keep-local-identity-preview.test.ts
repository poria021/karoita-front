import { describe, expect, it } from 'vitest';

import { keepLocalIdentityPreview } from './keep-local-identity-preview';
import type { User } from '@/types/auth';

const baseUser: User = {
  id: 'u1',
  firstName: 'Ali',
  lastName: 'Karimi',
  mobile: '9300000000',
  role: 'student',
  approved: false,
  docStatus: 'pending_admin',
};

describe('keepLocalIdentityPreview', () => {
  it('keeps a data-URL preview when /auth/me returns a storage key', () => {
    const previous = {
      ...baseUser,
      docUrl: 'data:image/webp;base64,abc',
    };
    const incoming = { ...baseUser, docUrl: 'abc.jpg' };
    expect(keepLocalIdentityPreview(previous, incoming).docUrl).toBe(
      'data:image/webp;base64,abc'
    );
  });

  it('does not leak a preview onto a different user', () => {
    const previous = {
      ...baseUser,
      docUrl: 'data:image/webp;base64,abc',
    };
    const incoming = { ...baseUser, id: 'u2', docUrl: 'abc.jpg' };
    expect(keepLocalIdentityPreview(previous, incoming).docUrl).toBe('abc.jpg');
  });
});
