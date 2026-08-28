import { useSyncExternalStore } from 'react';

import { setRuntimeAuthBoot } from '@/store/sessionBoot';

/**
 * Login/logout overlay phase. Lives outside React so it survives the
 * auth layout unmounting and the (app) layout mounting (and the reverse).
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

export function useAuthTransitionPhase(): AuthTransitionPhase {
  return useSyncExternalStore(
    subscribeAuthTransition,
    getAuthTransitionPhase,
    getAuthTransitionPhase
  );
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

/** Call synchronously before navigating into the dashboard after auth. */
export function beginEnteringApp(): void {
  setRuntimeAuthBoot('authenticated');
  setAuthTransitionPhase('entering');
}

/** Call synchronously before clearing the session and leaving the dashboard. */
export function beginLeavingApp(): void {
  setAuthTransitionPhase('leaving');
}
