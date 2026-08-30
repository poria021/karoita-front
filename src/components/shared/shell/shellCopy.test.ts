import { describe, expect, it } from 'vitest';

import {
  kvShellAdminHeaderPadXClassName,
  kvShellAdminMainGutterClassName,
  kvShellAdminRailClearanceClassName,
  kvShellAdminRailClearanceMotionClassName,
  kvShellAdminRailCollapsedClassName,
  kvShellAdminRailExpandedClassName,
  kvShellAdminRailMotionClassName,
  kvShellAdminRailWidthMotionClassName,
  kvShellRailLabelMotionClassName,
  kvShellFocusRingClassName,
  kvShellOverlayRowPadClassName,
} from './shellChrome';
import { kvScrollAreaClassName } from '@/components/shared/KvScrollArea';
import {
  lockedNavAriaLabel,
  lockedNavTitle,
  notificationsMenuAriaLabel,
  shellCopy,
} from './shellCopy';

describe('shellCopy', () => {
  it('keeps institutional notification phrases', () => {
    expect(shellCopy.notifications.empty).toBeTruthy();
    expect(shellCopy.notifications.markAllRead).toContain('خواند');
    expect(shellCopy.notifications.title).toContain('اعلان');
  });

  it('builds unread aria labels with Persian digit display strings', () => {
    expect(notificationsMenuAriaLabel(0, '۰')).toBe(
      shellCopy.notifications.menuLabel
    );
    expect(notificationsMenuAriaLabel(3, '۳')).toBe('اعلان‌ها، ۳ خوانده‌نشده');
  });

  it('builds locked nav labels without inventing a second phrasing', () => {
    expect(lockedNavTitle('ساختار سازمانی')).toBe(
      `ساختار سازمانی (${shellCopy.nav.lockedSuffix})`
    );
    expect(lockedNavAriaLabel('ساختار سازمانی')).toBe(
      `ساختار سازمانی — ${shellCopy.nav.lockedUntilDocs}`
    );
  });
});

describe('shellChrome', () => {
  it('exposes shared focus-ring and overlay pad recipes', () => {
    expect(kvShellFocusRingClassName).toContain('focus-visible:ring-kv-ring');
    expect(kvShellOverlayRowPadClassName).toContain('px-kv-inline');
    expect(kvShellOverlayRowPadClassName).toContain('py-kv-nav');
  });

  it('clears the fixed admin rail on the inline-start edge', () => {
    expect(kvShellAdminRailClearanceClassName(false)).toBe(
      kvShellAdminRailExpandedClassName
    );
    expect(kvShellAdminRailClearanceClassName(true)).toBe(
      kvShellAdminRailCollapsedClassName
    );
    expect(kvShellAdminRailExpandedClassName).toContain('lg:ps-72');
    expect(kvShellAdminRailCollapsedClassName).toContain('lg:ps-24');
    expect(kvShellAdminMainGutterClassName).toBe('px-0 sm:px-kv-group');
    expect(kvScrollAreaClassName).toBe('kv-scroll-area');
    expect(kvShellAdminHeaderPadXClassName).toBe('px-kv-group');
    expect(kvShellAdminRailMotionClassName).toContain('duration-500');
    expect(kvShellAdminRailWidthMotionClassName).toContain('duration-500');
    expect(kvShellAdminRailClearanceMotionClassName).toContain(
      'padding-inline-start'
    );
    expect(kvShellRailLabelMotionClassName).toContain('duration-500');
    expect(kvShellRailLabelMotionClassName).toContain('max-width');
  });
});
