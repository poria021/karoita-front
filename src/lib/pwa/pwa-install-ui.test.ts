import { describe, expect, it } from 'vitest';

import { shouldShowPwaInstallBanner } from '@/lib/pwa/pwa-install-ui';

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
