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
  // Chrome با `preventDefault` بدون `prompt()` فوری «Banner not shown» می‌نویسد؛ قرارداد نصب تأخیری است، نه نشت.
  event.preventDefault();
  deferredPrompt = event;
  emit();
}

/**
 * یک‌بار در هر JS realm. Strict Mode و Fast Refresh، `PwaBoot` را دوباره mount می‌کنند
 * بدون اینکه `beforeinstallprompt` دوباره بیاید؛ شنوندهٔ تکراری هشدار بنر Chrome را تکرار
 * می‌کند و ممکن است رویداد deferred را از دست بدهد.
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

/** فقط تست: شنوندهٔ singleton و prompt ذخیره‌شده را بردار. */
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

/**
 * Chrome/Edge می‌توانند PWA نصب‌شده را از تب مرورگر هم ببینند
 * (`getInstalledRelatedApps` + `related_applications` در manifest).
 * standalone یعنی همین پنجره خودش اپ است.
 */
export async function isKarvitaPwaInstalled(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (isDisplayStandalone()) return true;

  const nav = window.navigator as Navigator & {
    getInstalledRelatedApps?: () => Promise<Array<{ platform: string }>>;
  };
  if (typeof nav.getInstalledRelatedApps !== 'function') return false;

  try {
    const apps = await nav.getInstalledRelatedApps();
    // Chrome گاهی platform را خالی یا غیر webapp برمی‌گرداند.
    return apps.length > 0;
  } catch {
    return false;
  }
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

/** Safari روی macOS هم `beforeinstallprompt` نمی‌فرستد — نصب دستی لازم است. */
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

/** اگر این مرورگر نصب native ندارد، کدام راهنمای دستی را نشان دهیم. */
export function getManualInstallPlatform(): ManualInstallPlatform {
  if (isIosSafariInstallHint()) return 'ios';
  if (isMacSafariInstallHint()) return 'mac-safari';
  return null;
}
