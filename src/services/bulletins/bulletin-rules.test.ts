import { describe, expect, it } from 'vitest';

import type { Bulletin, UpsertBulletinInput } from '@/types/bulletins';

import {
  audienceRolesFor,
  buildBulletin,
  canPublishAdvertisements,
  canPublishAnnouncements,
  canReceiveBulletins,
  validateBulletinInput,
} from './bulletin-rules';

const announcement = (patch: Partial<Bulletin> = {}): Bulletin => ({
  id: 'b1',
  kind: 'announcement',
  title: 't',
  body: 'b',
  authorRole: 'faculty_role',
  authorName: 'x',
  audienceRoles: ['student', 'supervisor_professor'],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...patch,
});

const input = (patch: Partial<UpsertBulletinInput> = {}): UpsertBulletinInput => ({
  kind: 'announcement',
  title: 'عنوان',
  body: 'متن',
  audienceRoles: ['student'],
  ...patch,
});

describe('bulletin-rules', () => {
  it('only staff admins publish ads; learners publish nothing', () => {
    expect(canPublishAdvertisements('super_admin')).toBe(true);
    expect(canPublishAdvertisements('assistant_admin')).toBe(true);
    expect(canPublishAdvertisements('central_organization')).toBe(false);
    expect(canPublishAnnouncements('faculty_role')).toBe(true);
    expect(canPublishAnnouncements('student')).toBe(false);
    expect(canPublishAnnouncements('skill_learner')).toBe(false);
  });

  it('super admin is the only role nobody announces to', () => {
    expect(canReceiveBulletins('super_admin')).toBe(false);
    expect(canReceiveBulletins('assistant_admin')).toBe(true);
    expect(canReceiveBulletins('student')).toBe(true);
    expect(audienceRolesFor('student', 'announcement')).toEqual([]);
  });

  it('validates kind, audience and link', () => {
    expect(validateBulletinInput(input(), 'faculty_role')).toBeNull();
    expect(
      validateBulletinInput(input({ kind: 'advertisement' }), 'faculty_role')
    ).toMatch(/تبلیغ/);
    expect(
      validateBulletinInput(input({ audienceRoles: ['school_principal'] }), 'faculty_role')
    ).toMatch(/زیرمجموعه/);
    expect(validateBulletinInput(input({ audienceRoles: [] }), 'faculty_role')).toMatch(
      /مخاطب/
    );
    expect(
      validateBulletinInput(
        input({
          kind: 'advertisement',
          imageUrl: 'data:image/png;base64,AAAA',
          linkUrl: 'javascript:alert(1)',
        }),
        'super_admin'
      )
    ).toMatch(/لینک/);
  });

  it('ads need an image and no text; announcements still need text', () => {
    const img = 'data:image/png;base64,AAAA';
    expect(
      validateBulletinInput(
        input({ kind: 'advertisement', body: '', imageUrl: img, audienceRoles: ['student'] }),
        'super_admin'
      )
    ).toBeNull();
    expect(
      validateBulletinInput(input({ kind: 'advertisement', body: '' }), 'super_admin')
    ).toMatch(/تصویر/);
    expect(validateBulletinInput(input({ body: '', imageUrl: img }), 'faculty_role')).toMatch(
      /متن/
    );
    expect(
      validateBulletinInput(
        input({ kind: 'advertisement', imageUrl: 'javascript:alert(1)' }),
        'super_admin'
      )
    ).toMatch(/تصویر/);
    // تصویر روی اطلاعیه ذخیره نمی‌شود.
    expect(
      buildBulletin(input({ imageUrl: img }), { role: 'faculty_role', name: 'x' }).imageUrl
    ).toBeUndefined();
  });

  it('editing keeps the original author panel', () => {
    const existing = announcement({ authorRole: 'super_admin', authorName: 'A' });
    const next = buildBulletin(
      input({ title: ' جدید ' }),
      { role: 'assistant_admin', name: 'B' },
      existing
    );
    expect(next.authorRole).toBe('super_admin');
    expect(next.authorName).toBe('A');
    expect(next.title).toBe('جدید');
    expect(next.createdAt).toBe(existing.createdAt);
  });
});
