export type KarvitaBeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

type Listener = () => void;

let deferredPrompt: KarvitaBeforeInstallPromptEvent | null = null;
const listeners = new Set<Listener>();
let removeInstallPromptCapture: (() => void) | null = null;

function emit(): void {
  for (const listener of listeners) listener();
}

export function subscribePwaInstallAvailability(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function captureBeforeInstallPrompt(
  event: KarvitaBeforeInstallPromptEvent
): void {
  // Chrome logs "Banner not shown" whenever preventDefault runs without an
  // immediate prompt() — that is the deferred-install contract, not a leak.
  event.preventDefault();
  deferredPrompt = event;
  emit();
}

/**
 * Bind once per JS realm. React Strict Mode and Fast Refresh remount PwaBoot
 * without re-firing beforeinstallprompt; stacking listeners repeats Chrome's
 * banner warning and can drop the deferred event.
 */
export function ensureBeforeInstallPromptCapture(): void {
  if (typeof window === 'undefined' || removeInstallPromptCapture) return;

  const onInstallPrompt = (event: Event) => {
    captureBeforeInstallPrompt(event as KarvitaBeforeInstallPromptEvent);
  };

  window.addEventListener('beforeinstallprompt', onInstallPrompt);
  removeInstallPromptCapture = () => {
    window.removeEventListener('beforeinstallprompt', onInstallPrompt);
    removeInstallPromptCapture = null;
  };
}

/** Test-only: drop the singleton listener and captured prompt. */
export function resetBeforeInstallPromptCapture(): void {
  removeInstallPromptCapture?.();
  deferredPrompt = null;
}

export function peekPwaInstallPrompt(): KarvitaBeforeInstallPromptEvent | null {
  return deferredPrompt;
}

export async function promptPwaInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  const event = deferredPrompt;
  if (!event) return 'unavailable';
  deferredPrompt = null;
  emit();
  await event.prompt();
  const choice = await event.userChoice;
  return choice.outcome;
}

export function isDisplayStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const media = window.matchMedia('(display-mode: standalone)');
  const legacy = (window.navigator as Navigator & { standalone?: boolean }).standalone;
  return media.matches || legacy === true;
}

export function isIosSafariInstallHint(): boolean {
  if (typeof window === 'undefined') return false;
  if (isDisplayStandalone()) return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

/** Safari on macOS also never fires `beforeinstallprompt` — needs manual steps too. */
export function isMacSafariInstallHint(): boolean {
  if (typeof window === 'undefined') return false;
  if (isDisplayStandalone()) return false;
  const ua = window.navigator.userAgent;
  const isMac = /macintosh/i.test(ua) && !/(iphone|ipad|ipod)/i.test(ua);
  const isSafari =
    /safari/i.test(ua) && !/(chrome|chromium|crios|edg|firefox|fxios)/i.test(ua);
  return isMac && isSafari;
}

export type ManualInstallPlatform = 'ios' | 'mac-safari' | null;

/** Which manual install instructions (if any) this browser needs. */
export function getManualInstallPlatform(): ManualInstallPlatform {
  if (isIosSafariInstallHint()) return 'ios';
  if (isMacSafariInstallHint()) return 'mac-safari';
  return null;
}
