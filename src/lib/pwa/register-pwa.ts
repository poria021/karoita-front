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

/** First SW activation often needs a reload before Chrome fires `beforeinstallprompt`. */
export function shouldReloadToPrimePwa(input: {
  alreadyPrimed: boolean;
  hasController: boolean;
}): boolean {
  return !input.alreadyPrimed && !input.hasController;
}

/**
 * Register after first paint (rAF), not after a long idle — Chrome's install
 * check often runs before requestIdleCallback (up to 4s).
 */
export function scheduleKarvitaServiceWorkerRegistration(
  register: (scriptUrl: string) => Promise<unknown>
): void {
  if (typeof window === 'undefined') return;

  const run = () => {
    void register(PWA_SW_PATH).catch(() => {
      // Registration failures must not break the app shell.
    });
  };

  if (typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(() => run());
    return;
  }

  window.setTimeout(run, 0);
}
