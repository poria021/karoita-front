import { describe, expect, it } from 'vitest';

import {
  keepLocalIdentityPreview,
  retainSessionOrgFields,
} from './keep-local-identity-preview';
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

  it('prefers a same-origin media URL over a leftover data preview', () => {
    const previous = {
      ...baseUser,
      docUrl: 'data:image/webp;base64,abc',
    };
    const incoming = {
      ...baseUser,
      docUrl: '/api/files/media?src=https%3A%2F%2Ffiles.example.com%2Fa.jpg',
    };
    expect(keepLocalIdentityPreview(previous, incoming).docUrl).toBe(
      incoming.docUrl
    );
  });
});

describe('retainSessionOrgFields', () => {
  it('keeps previous org fields when PATCH /auth/me omits them', () => {
    const previous = {
      ...baseUser,
      province: ['تهران'],
      college: ['پردیس'],
      major: 'آموزش',
      studentId: '140210345',
    };
    const incoming = { ...baseUser, firstName: 'نیما' };
    const merged = retainSessionOrgFields(previous, incoming);
    expect(merged.firstName).toBe('نیما');
    expect(merged.province).toEqual(['تهران']);
    expect(merged.college).toEqual(['پردیس']);
    expect(merged.major).toBe('آموزش');
    expect(merged.studentId).toBe('140210345');
  });

  it('lets an explicit empty org array from the server win', () => {
    const previous = { ...baseUser, province: ['تهران'] };
    const incoming = { ...baseUser, province: [] };
    expect(retainSessionOrgFields(previous, incoming).province).toEqual([]);
  });
});
