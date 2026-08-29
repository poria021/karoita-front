import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  runPwaInstallFlow,
  shouldShowPwaInstallMenuItem,
} from '@/components/shared/shell/PwaInstallControl';
import {
  captureBeforeInstallPrompt,
  ensureBeforeInstallPromptCapture,
  getManualInstallPlatform,
  peekPwaInstallPrompt,
  promptPwaInstall,
  resetBeforeInstallPromptCapture,
  type KarvitaBeforeInstallPromptEvent,
} from '@/lib/pwa/pwa-install';
import * as pwaInstallUi from '@/lib/pwa/pwa-install-ui';

const CHROME_WIN =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const IOS_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const MAC_SAFARI =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
const MAC_CHROME =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function fakePromptEvent(): KarvitaBeforeInstallPromptEvent {
  const event = new Event('beforeinstallprompt', {
    cancelable: true,
  }) as KarvitaBeforeInstallPromptEvent;
  event.prompt = vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({
    outcome: 'accepted',
    platform: 'web',
  });
  return event;
}

function stubBrowser(ua: string): void {
  Object.defineProperty(window.navigator, 'userAgent', {
    configurable: true,
    value: ua,
  });
  vi.spyOn(window, 'matchMedia').mockReturnValue({
    matches: false,
    media: '(display-mode: standalone)',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
    onchange: null,
  } as MediaQueryList);
}

afterEach(() => {
  resetBeforeInstallPromptCapture();
  vi.restoreAllMocks();
});

describe('pwa install prompt store', () => {
  it('captures native prompt and consumes it once', async () => {
    const event = fakePromptEvent();
    captureBeforeInstallPrompt(event);
    expect(peekPwaInstallPrompt()).toBe(event);
    await expect(promptPwaInstall()).resolves.toBe('accepted');
    expect(peekPwaInstallPrompt()).toBeNull();
    await expect(promptPwaInstall()).resolves.toBe('unavailable');
  });

  it('binds beforeinstallprompt only once across repeated boots', () => {
    const add = vi.spyOn(window, 'addEventListener');
    ensureBeforeInstallPromptCapture();
    ensureBeforeInstallPromptCapture();
    const binds = add.mock.calls.filter(
      ([type]) => type === 'beforeinstallprompt'
    );
    expect(binds).toHaveLength(1);
  });

  it('captures a dispatched beforeinstallprompt via the singleton listener', () => {
    ensureBeforeInstallPromptCapture();
    const event = fakePromptEvent();
    window.dispatchEvent(event);
    expect(peekPwaInstallPrompt()).toBe(event);
  });
});

describe('getManualInstallPlatform', () => {
  it('detects iOS and Mac Safari, not Chrome on Mac or Windows', () => {
    stubBrowser(IOS_SAFARI);
    expect(getManualInstallPlatform()).toBe('ios');
    stubBrowser(MAC_SAFARI);
    expect(getManualInstallPlatform()).toBe('mac-safari');
    stubBrowser(MAC_CHROME);
    expect(getManualInstallPlatform()).toBeNull();
    stubBrowser(CHROME_WIN);
    expect(getManualInstallPlatform()).toBeNull();
  });
});

describe('runPwaInstallFlow', () => {
  it('opens the guide only on iOS / Mac Safari', () => {
    const open = vi.spyOn(pwaInstallUi, 'openPwaInstallDialog');
    stubBrowser(IOS_SAFARI);
    runPwaInstallFlow();
    expect(open).toHaveBeenCalledTimes(1);

    stubBrowser(MAC_SAFARI);
    runPwaInstallFlow();
    expect(open).toHaveBeenCalledTimes(2);
  });

  it('prompts native install without a confirm dialog on Chrome', () => {
    const open = vi.spyOn(pwaInstallUi, 'openPwaInstallDialog');
    captureBeforeInstallPrompt(fakePromptEvent());
    stubBrowser(CHROME_WIN);
    runPwaInstallFlow();
    expect(open).not.toHaveBeenCalled();
    expect(peekPwaInstallPrompt()).toBeNull();
  });
});

describe('shouldShowPwaInstallMenuItem', () => {
  it('hides install when already running standalone', () => {
    expect(shouldShowPwaInstallMenuItem(true)).toBe(false);
    expect(shouldShowPwaInstallMenuItem(false)).toBe(true);
  });
});
