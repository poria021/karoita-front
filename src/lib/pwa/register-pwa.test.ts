import { describe, expect, it, vi } from 'vitest';

import { PWA_SW_PATH } from '@/lib/pwa/pwa-cache-policy';
import {
  scheduleKarvitaServiceWorkerRegistration,
  shouldRegisterKarvitaServiceWorker,
  shouldReloadToPrimePwa,
  shouldUnregisterKarvitaServiceWorkerInDev,
} from '@/lib/pwa/register-pwa';

describe('shouldRegisterKarvitaServiceWorker', () => {
  it('registers only in production browsers with SW support', () => {
    expect(
      shouldRegisterKarvitaServiceWorker({
        nodeEnv: 'development',
        hasWindow: true,
        hasServiceWorker: true,
      })
    ).toBe(false);
    expect(
      shouldRegisterKarvitaServiceWorker({
        nodeEnv: 'production',
        hasWindow: true,
        hasServiceWorker: true,
      })
    ).toBe(true);
  });
});

describe('shouldUnregisterKarvitaServiceWorkerInDev', () => {
  it('unregisters leftover SW control in non-production', () => {
    expect(
      shouldUnregisterKarvitaServiceWorkerInDev({
        nodeEnv: 'development',
        hasServiceWorker: true,
      })
    ).toBe(true);
    expect(
      shouldUnregisterKarvitaServiceWorkerInDev({
        nodeEnv: 'production',
        hasServiceWorker: true,
      })
    ).toBe(false);
  });
});

describe('shouldReloadToPrimePwa', () => {
  it('reloads once when the SW is not yet controlling the page', () => {
    expect(
      shouldReloadToPrimePwa({ alreadyPrimed: false, hasController: false })
    ).toBe(true);
    expect(
      shouldReloadToPrimePwa({ alreadyPrimed: true, hasController: false })
    ).toBe(false);
    expect(
      shouldReloadToPrimePwa({ alreadyPrimed: false, hasController: true })
    ).toBe(false);
  });
});

describe('scheduleKarvitaServiceWorkerRegistration', () => {
  it('registers on the next animation frame after paint', () => {
    const raf = vi.fn((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
    vi.stubGlobal('requestAnimationFrame', raf);
    const register = vi.fn().mockResolvedValue(undefined);
    scheduleKarvitaServiceWorkerRegistration(register);
    expect(raf).toHaveBeenCalled();
    expect(register).toHaveBeenCalledWith(PWA_SW_PATH);
    vi.unstubAllGlobals();
  });
});
