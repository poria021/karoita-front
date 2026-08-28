/**
 * Auth-boot flags that must survive AppAuthGuard remounts.
 *
 * Next.js can remount the (app) client shell on segment navigation while the
 * JS runtime (memory tokens, Zustand) is still the same tab. A useState/useRef
 * inside the guard resets on that remount and would flash the full-viewport
 * loader between dashboard tabs/modules.
 */

export type RuntimeAuthBoot = 'authenticated' | 'unauthenticated';

let runtimeBoot: RuntimeAuthBoot | null = null;
let restorePromise: Promise<RuntimeAuthBoot> | null = null;

export function getRuntimeAuthBoot(): RuntimeAuthBoot | null {
  return runtimeBoot;
}

export function setRuntimeAuthBoot(boot: RuntimeAuthBoot): void {
  runtimeBoot = boot;
}

export function resetRuntimeAuthBoot(): void {
  runtimeBoot = null;
  restorePromise = null;
}

export function ensureAuthRestore(
  restore: () => Promise<RuntimeAuthBoot>
): Promise<RuntimeAuthBoot> {
  if (runtimeBoot) return Promise.resolve(runtimeBoot);
  if (!restorePromise) {
    restorePromise = restore()
      .then((boot) => {
        if (runtimeBoot) return runtimeBoot;
        runtimeBoot = boot;
        return boot;
      })
      .catch((error) => {
        restorePromise = null;
        throw error;
      });
  }
  return restorePromise;
}
