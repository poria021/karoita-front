'use client';

import { useSyncExternalStore } from 'react';

import {
  getAuthTransitionPhase,
  subscribeAuthTransition,
  type AuthTransitionPhase,
} from '@/store/authTransition';

export function useAuthTransitionPhase(): AuthTransitionPhase {
  return useSyncExternalStore(
    subscribeAuthTransition,
    getAuthTransitionPhase,
    getAuthTransitionPhase
  );
}
