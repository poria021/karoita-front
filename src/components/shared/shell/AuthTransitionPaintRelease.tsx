'use client';

import { useLayoutEffect } from 'react';

import {
  clearAuthTransition,
  runAfterPaint,
  useAuthTransitionPhase,
  type AuthTransitionPhase,
} from '@/store/authTransition';

/**
 * Drops the auth overlay after this route's HTML has committed.
 * Mount in the destination layout — never in the origin shell.
 */
export function AuthTransitionPaintRelease({
  when,
}: {
  when: Extract<AuthTransitionPhase, 'entering' | 'leaving'>;
}) {
  const phase = useAuthTransitionPhase();

  useLayoutEffect(() => {
    if (phase !== when) return;
    return runAfterPaint(clearAuthTransition);
  }, [phase, when]);

  return null;
}
