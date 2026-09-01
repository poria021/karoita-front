/**
 * پرچم boot نشست باید از remount گارد `(app)` جان سالم به در ببرد.
 * Next ممکن است پوسته را عوض کند در حالی که حافظهٔ تب (توکن، Zustand) همان است؛
 * `useState` داخل گارد لودر تمام‌صفحه بین ماژول‌ها را چشمک می‌زند.
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
