import { PWA_SW_PATH } from '@/lib/pwa/pwa-cache-policy';

export const PWA_SW_PRIMED_STORAGE_KEY = 'karvita-pwa-sw-primed';

export function shouldRegisterKarvitaServiceWorker(input: {
  nodeEnv: string | undefined;
  hasWindow: boolean;
  hasServiceWorker: boolean;
}): boolean {
  return (
    input.nodeEnv === 'production' &&
    input.hasWindow &&
    input.hasServiceWorker
  );
}

/** در dev/HMR نباید SW پروداکشن بماند که chunk کهنهٔ Turbopack سرو کند. */
export function shouldUnregisterKarvitaServiceWorkerInDev(input: {
  nodeEnv: string | undefined;
  hasServiceWorker: boolean;
}): boolean {
  return input.nodeEnv !== 'production' && input.hasServiceWorker;
}

export async function unregisterStaleKarvitaServiceWorkers(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));

  if (typeof caches === 'undefined') return;
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => caches.delete(key)));
}

/** اولین فعال‌سازی SW معمولاً یک reload می‌خواهد تا Chrome `beforeinstallprompt` بفرستد. */
export function shouldReloadToPrimePwa(input: {
  alreadyPrimed: boolean;
  hasController: boolean;
}): boolean {
  return !input.alreadyPrimed && !input.hasController;
}

/**
 * ثبت بعد از اولین paint (`rAF`)، نه بعد از idle طولانی — بررسی نصب Chrome
 * اغلب قبل از `requestIdleCallback` (تا ۴ ثانیه) اجرا می‌شود.
 */
export function scheduleKarvitaServiceWorkerRegistration(
  register: (scriptUrl: string) => Promise<unknown>
): void {
  if (typeof window === 'undefined') return;

  const run = () => {
    void register(PWA_SW_PATH).catch(() => {
      // شکست ثبت نباید شِل را بشکند.
    });
  };

  if (typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(() => run());
    return;
  }

  window.setTimeout(run, 0);
}
