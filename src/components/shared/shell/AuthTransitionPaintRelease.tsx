'use client';

import { useLayoutEffect } from 'react';

import {
  clearAuthTransition,
  runAfterPaint,
  type AuthTransitionPhase,
} from '@/store/authTransition';
import { useAuthTransitionPhase } from '@/store/useAuthTransitionPhase';

/**
 * `overlay` احراز را بعد از commit HTML همین مسیر برمی‌دارد.
 * در لایوت مقصد بگذار — نه در شل مبدأ.
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
