import { setRuntimeAuthBoot } from '@/store/sessionBoot';

/**
 * فاز overlay ورود/خروج — خارج از React تا عوض‌شدن layout auth و `(app)` آن را صفر نکند.
 */

export type AuthTransitionPhase = 'idle' | 'entering' | 'leaving';

const AUTH_TRANSITION_FAILSAFE_MS = 8_000;

let phase: AuthTransitionPhase = 'idle';
let failsafeTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function clearFailsafe(): void {
  if (failsafeTimer == null) return;
  clearTimeout(failsafeTimer);
  failsafeTimer = null;
}

function armFailsafe(): void {
  clearFailsafe();
  failsafeTimer = setTimeout(() => {
    failsafeTimer = null;
    if (phase === 'idle') return;
    phase = 'idle';
    emit();
  }, AUTH_TRANSITION_FAILSAFE_MS);
}

export function getAuthTransitionPhase(): AuthTransitionPhase {
  return phase;
}

export function setAuthTransitionPhase(next: AuthTransitionPhase): void {
  if (phase === next) return;
  phase = next;
  if (next === 'idle') {
    clearFailsafe();
  } else {
    armFailsafe();
  }
  emit();
}

export function clearAuthTransition(): void {
  setAuthTransitionPhase('idle');
}

export function subscribeAuthTransition(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function runAfterPaint(callback: () => void): () => void {
  let second = 0;
  const first = requestAnimationFrame(() => {
    second = requestAnimationFrame(callback);
  });
  return () => {
    cancelAnimationFrame(first);
    cancelAnimationFrame(second);
  };
}

/** هم‌زمان با ناوبری به داشبورد بعد از auth صدا زده شود. */
export function beginEnteringApp(): void {
  setRuntimeAuthBoot('authenticated');
  setAuthTransitionPhase('entering');
}

/** هم‌زمان با پاک‌کردن نشست و خروج از داشبورد صدا زده شود. */
export function beginLeavingApp(): void {
  setAuthTransitionPhase('leaving');
}

/** صبر تا overlay/گارد روی پوستهٔ داشبورد رنگ شود. */
export function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}
