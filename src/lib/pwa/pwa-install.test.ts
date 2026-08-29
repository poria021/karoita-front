import { afterEach, describe, expect, it, vi } from 'vitest';

import { toast } from 'sonner';

import {
  runPwaInstallFlow,
  shouldShowPwaInstallMenuItem,
} from '@/components/shared/shell/PwaInstallControl';
import { shellCopy } from '@/components/shared/shell/shellCopy';
import {
  captureBeforeInstallPrompt,
  ensureBeforeInstallPromptCapture,
  getManualInstallPlatform,
  isKarvitaPwaInstalled,
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

function stubBrowser(
  ua: string,
  options?: { standalone?: boolean; relatedApps?: Array<{ platform: string }> }
): void {
  Object.defineProperty(window.navigator, 'userAgent', {
    configurable: true,
    value: ua,
  });
  Object.defineProperty(window.navigator, 'getInstalledRelatedApps', {
    configurable: true,
    value: options?.relatedApps
      ? vi.fn().mockResolvedValue(options.relatedApps)
      : undefined,
  });
  vi.spyOn(window, 'matchMedia').mockReturnValue({
    matches: options?.standalone ?? false,
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

describe('isKarvitaPwaInstalled', () => {
  it('is true in standalone or when Chrome reports a webapp', async () => {
    stubBrowser(CHROME_WIN, { standalone: true });
    await expect(isKarvitaPwaInstalled()).resolves.toBe(true);

    stubBrowser(CHROME_WIN, { relatedApps: [{ platform: 'windows' }] });
    await expect(isKarvitaPwaInstalled()).resolves.toBe(true);

    stubBrowser(CHROME_WIN);
    await expect(isKarvitaPwaInstalled()).resolves.toBe(false);
  });
});

describe('runPwaInstallFlow', () => {
  it('opens the guide only on iOS / Mac Safari', async () => {
    const open = vi.spyOn(pwaInstallUi, 'openPwaInstallDialog');
    stubBrowser(IOS_SAFARI);
    await runPwaInstallFlow();
    expect(open).toHaveBeenCalledTimes(1);

    stubBrowser(MAC_SAFARI);
    await runPwaInstallFlow();
    expect(open).toHaveBeenCalledTimes(2);
  });

  it('prompts native install without a confirm dialog on Chrome', async () => {
    const open = vi.spyOn(pwaInstallUi, 'openPwaInstallDialog');
    captureBeforeInstallPrompt(fakePromptEvent());
    stubBrowser(CHROME_WIN);
    await runPwaInstallFlow();
    expect(open).not.toHaveBeenCalled();
    expect(peekPwaInstallPrompt()).toBeNull();
  });

  it('toasts instead of prompting when the PWA is already installed', async () => {
    const open = vi.spyOn(pwaInstallUi, 'openPwaInstallDialog');
    const notify = vi.spyOn(toast, 'warning');
    captureBeforeInstallPrompt(fakePromptEvent());
    stubBrowser(CHROME_WIN, { relatedApps: [{ platform: 'webapp' }] });
    await runPwaInstallFlow();
    expect(notify).toHaveBeenCalledWith(shellCopy.account.installAppAlreadyInstalled);
    expect(open).not.toHaveBeenCalled();
    expect(peekPwaInstallPrompt()).not.toBeNull();
  });

  it('toasts when Chrome has no native install prompt', async () => {
    const notify = vi.spyOn(toast, 'warning');
    stubBrowser(CHROME_WIN);
    await runPwaInstallFlow();
    expect(notify).toHaveBeenCalledWith(shellCopy.account.installAppAlreadyInstalled);
  });
});

describe('shouldShowPwaInstallMenuItem', () => {
  it('keeps the install action visible so an installed app can toast', () => {
    expect(shouldShowPwaInstallMenuItem(true)).toBe(true);
    expect(shouldShowPwaInstallMenuItem(false)).toBe(true);
  });
});
