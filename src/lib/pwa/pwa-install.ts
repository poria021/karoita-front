export type KarvitaBeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

type Listener = () => void;

let deferredPrompt: KarvitaBeforeInstallPromptEvent | null = null;
const listeners = new Set<Listener>();

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
  event.preventDefault();
  deferredPrompt = event;
  emit();
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
