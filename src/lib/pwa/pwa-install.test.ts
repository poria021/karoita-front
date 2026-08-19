import { describe, expect, it, vi } from 'vitest';

import { shouldShowPwaInstallMenuItem } from '@/components/shared/shell/PwaInstallControl';
import {
  captureBeforeInstallPrompt,
  peekPwaInstallPrompt,
  promptPwaInstall,
  type KarvitaBeforeInstallPromptEvent,
} from '@/lib/pwa/pwa-install';

function fakePromptEvent(): KarvitaBeforeInstallPromptEvent {
  const event = new Event('beforeinstallprompt') as KarvitaBeforeInstallPromptEvent;
  event.prompt = vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({
    outcome: 'accepted',
    platform: 'web',
  });
  return event;
}

describe('pwa install prompt store', () => {
  it('captures native prompt and consumes it once', async () => {
    const event = fakePromptEvent();
    captureBeforeInstallPrompt(event);
    expect(peekPwaInstallPrompt()).toBe(event);
    await expect(promptPwaInstall()).resolves.toBe('accepted');
    expect(peekPwaInstallPrompt()).toBeNull();
    await expect(promptPwaInstall()).resolves.toBe('unavailable');
  });
});

describe('shouldShowPwaInstallMenuItem', () => {
  it('hides install when already running standalone', () => {
    expect(shouldShowPwaInstallMenuItem(true)).toBe(false);
    expect(shouldShowPwaInstallMenuItem(false)).toBe(true);
  });
});
