import { describe, expect, it } from 'vitest';

import {
  kvShellFocusRingClassName,
  kvShellOverlayRowPadClassName,
} from './shellChrome';
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
});
