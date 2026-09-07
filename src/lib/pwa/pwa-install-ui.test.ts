import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  dismissPwaInstallSuggestion,
  isPwaInstallDismissed,
  PWA_INSTALL_DISMISS_KEY,
  shouldShowPwaInstallBanner,
} from '@/lib/pwa/pwa-install-ui';

describe('shouldShowPwaInstallBanner', () => {
  it('shows only when Chrome can install and the user has not dismissed', () => {
    expect(
      shouldShowPwaInstallBanner({
        standalone: false,
        dismissed: false,
        nativeAvailable: true,
      })
    ).toBe(true);
    expect(
      shouldShowPwaInstallBanner({
        standalone: true,
        dismissed: false,
        nativeAvailable: true,
      })
    ).toBe(false);
    expect(
      shouldShowPwaInstallBanner({
        standalone: false,
        dismissed: true,
        nativeAvailable: true,
      })
    ).toBe(false);
    expect(
      shouldShowPwaInstallBanner({
        standalone: false,
        dismissed: false,
        nativeAvailable: false,
      })
    ).toBe(false);
  });
});

describe('dismissPwaInstallSuggestion / isPwaInstallDismissed', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns false before any dismissal', () => {
    expect(isPwaInstallDismissed()).toBe(false);
  });

  it('persists dismissal in localStorage so it survives new sessions', () => {
    dismissPwaInstallSuggestion();
    expect(localStorage.getItem(PWA_INSTALL_DISMISS_KEY)).toBe('1');
    expect(isPwaInstallDismissed()).toBe(true);
  });

  it('is not affected by sessionStorage — only localStorage', () => {
    sessionStorage.setItem(PWA_INSTALL_DISMISS_KEY, '1');
    expect(isPwaInstallDismissed()).toBe(false);
    sessionStorage.clear();
  });
});
