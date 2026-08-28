import { afterEach, describe, expect, it, vi } from 'vitest';

import { shouldShowPwaInstallMenuItem } from '@/components/shared/shell/PwaInstallControl';
import {
  captureBeforeInstallPrompt,
  ensureBeforeInstallPromptCapture,
  peekPwaInstallPrompt,
  promptPwaInstall,
  resetBeforeInstallPromptCapture,
  type KarvitaBeforeInstallPromptEvent,
} from '@/lib/pwa/pwa-install';

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

afterEach(() => {
  resetBeforeInstallPromptCapture();
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
    add.mockRestore();
  });

  it('captures a dispatched beforeinstallprompt via the singleton listener', () => {
    ensureBeforeInstallPromptCapture();
    const event = fakePromptEvent();
    window.dispatchEvent(event);
    expect(peekPwaInstallPrompt()).toBe(event);
  });
});

describe('shouldShowPwaInstallMenuItem', () => {
  it('hides install when already running standalone', () => {
    expect(shouldShowPwaInstallMenuItem(true)).toBe(false);
    expect(shouldShowPwaInstallMenuItem(false)).toBe(true);
  });
});
