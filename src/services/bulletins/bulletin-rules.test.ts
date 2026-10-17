import { describe, expect, it } from 'vitest';

import type { Bulletin, UpsertBulletinInput } from '@/types/bulletins';

import {
  audienceRolesFor,
  buildBulletin,
  canPublishAdvertisements,
  canPublishAnnouncements,
  canReceiveBulletins,
  dashboardBulletinSources,
  isBulletinOwnedBy,
  isBulletinVisibleTo,
  normalizeBulletin,
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
  provinces: ['تهران'],
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...patch,
});

const input = (patch: Partial<UpsertBulletinInput> = {}): UpsertBulletinInput => ({
  kind: 'announcement',
  title: 'عنوان',
  body: 'متن',
  audienceRoles: ['student'],
  provinces: ['تهران'],
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

  it('announcement reaches only subordinate roles', () => {
    const row = announcement();
    expect(isBulletinVisibleTo(row, 'student')).toBe(true);
    expect(isBulletinVisibleTo(row, 'provincial_university')).toBe(false);
    expect(isBulletinVisibleTo(row, 'skill_learner')).toBe(false);
    // مخاطب ذخیره‌شدهٔ خارج از سلسله‌مراتب نشت نمی‌کند.
    expect(
      isBulletinVisibleTo(
        announcement({ audienceRoles: ['central_organization'] }),
        'central_organization'
      )
    ).toBe(false);
  });

  it('inactive bulletins are hidden from every audience', () => {
    expect(isBulletinVisibleTo(announcement({ isActive: false }), 'student')).toBe(false);
    expect(isBulletinVisibleTo(announcement({ isActive: true }), 'student')).toBe(true);
  });

  it('province audience matches viewer provinces; empty means all provinces', () => {
    const row = announcement({ provinces: ['تهران', 'قم'] });
    expect(isBulletinVisibleTo(row, 'student', ['قم'])).toBe(true);
    expect(isBulletinVisibleTo(row, 'student', ['یزد'])).toBe(false);
    // بیننده بدون استان فقط موارد بدون محدودیت استان را می‌بیند.
    expect(isBulletinVisibleTo(row, 'student', [])).toBe(false);
    // ندادن استان بیننده = بدون فیلتر استان.
    expect(isBulletinVisibleTo(row, 'student')).toBe(true);
    // دادهٔ قدیمی بدون استان برای همهٔ استان‌ها دیده می‌شود.
    expect(isBulletinVisibleTo(announcement({ provinces: [] }), 'student', ['یزد'])).toBe(
      true
    );
    expect(isBulletinVisibleTo(announcement({ provinces: [] }), 'student', [])).toBe(true);
  });

  it('normalizes legacy rows saved without provinces or status', () => {
    const legacy = { ...announcement(), provinces: undefined, isActive: undefined };
    const row = normalizeBulletin(legacy as unknown as Bulletin);
    expect(row.provinces).toEqual([]);
    expect(row.isActive).toBe(true);
    expect(normalizeBulletin(announcement({ isActive: false })).isActive).toBe(false);
  });

  it('super admin is the only role nobody announces to', () => {
    expect(canReceiveBulletins('super_admin')).toBe(false);
    expect(canReceiveBulletins('assistant_admin')).toBe(true);
    expect(canReceiveBulletins('student')).toBe(true);
    expect(audienceRolesFor('student', 'announcement')).toEqual([]);
  });

  it('staff admins share ownership; other panels own their own rows', () => {
    const adminRow = announcement({ authorRole: 'super_admin' });
    expect(isBulletinOwnedBy(adminRow, 'assistant_admin')).toBe(true);
    expect(isBulletinOwnedBy(adminRow, 'faculty_role')).toBe(false);
    expect(isBulletinOwnedBy(announcement(), 'provincial_university')).toBe(false);
  });

  it('validates kind, audience, provinces and link', () => {
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
    expect(validateBulletinInput(input({ provinces: [] }), 'faculty_role')).toMatch(
      /استان/
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

  it('ads need a description or an image; announcements still need text', () => {
    const img = 'data:image/png;base64,AAAA';
    // فقط تصویر
    expect(
      validateBulletinInput(
        input({ kind: 'advertisement', body: '', imageUrl: img, audienceRoles: ['student'] }),
        'super_admin'
      )
    ).toBeNull();
    // فقط توضیحات
    expect(
      validateBulletinInput(
        input({ kind: 'advertisement', body: 'توضیح', audienceRoles: ['student'] }),
        'super_admin'
      )
    ).toBeNull();
    // هیچ‌کدام
    expect(
      validateBulletinInput(input({ kind: 'advertisement', body: '' }), 'super_admin')
    ).toMatch(/توضیحات یا تصویر/);
    expect(validateBulletinInput(input({ body: '', imageUrl: img }), 'faculty_role')).toMatch(
      /متن/
    );
    expect(
      validateBulletinInput(
        input({ kind: 'advertisement', imageUrl: 'javascript:alert(1)' }),
        'super_admin'
      )
    ).toMatch(/تصویر/);
    // تصویر روی اطلاعیه ذخیره نمی‌شود؛ ولی توضیحات تبلیغ نگه داشته می‌شود.
    expect(
      buildBulletin(input({ imageUrl: img }), { role: 'faculty_role', name: 'x' }).imageUrl
    ).toBeUndefined();
    expect(
      buildBulletin(
        input({ kind: 'advertisement', body: ' توضیح ', imageUrl: img }),
        { role: 'super_admin', name: 'x' }
      ).body
    ).toBe('توضیح');
  });

  it('new rows start active; editing keeps status and the original author panel', () => {
    const created = buildBulletin(input(), { role: 'faculty_role', name: 'x' });
    expect(created.isActive).toBe(true);
    expect(created.provinces).toEqual(['تهران']);

    const existing = announcement({ authorRole: 'super_admin', authorName: 'A', isActive: false });
    const next = buildBulletin(
      input({ title: ' جدید ', provinces: ['قم', 'قم', ' '] }),
      { role: 'assistant_admin', name: 'B' },
      existing
    );
    expect(next.authorRole).toBe('super_admin');
    expect(next.authorName).toBe('A');
    expect(next.title).toBe('جدید');
    expect(next.createdAt).toBe(existing.createdAt);
    expect(next.isActive).toBe(false);
    expect(next.provinces).toEqual(['قم']);
  });

  it('every panel gets an ad and an announcements source on the dashboard', () => {
    expect(dashboardBulletinSources('super_admin')).toEqual({
      advertisement: 'published',
      announcement: 'published',
    });
    expect(dashboardBulletinSources('assistant_admin')).toEqual({
      advertisement: 'published',
      announcement: 'received',
    });
    expect(dashboardBulletinSources('student')).toEqual({
      advertisement: 'received',
      announcement: 'received',
    });
    expect(dashboardBulletinSources('school_principal')).toEqual({
      advertisement: 'received',
      announcement: 'received',
    });
  });
});
