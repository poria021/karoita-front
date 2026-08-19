import { useSyncExternalStore } from 'react';

import {
  isDisplayStandalone,
  peekPwaInstallPrompt,
  subscribePwaInstallAvailability,
} from '@/lib/pwa/pwa-install';
import {
  peekPwaInstallDialogOpen,
  subscribePwaInstallDialog,
} from '@/lib/pwa/pwa-install-ui';

function subscribe(onStoreChange: () => void): () => void {
  return subscribePwaInstallAvailability(onStoreChange);
}

function getSnapshot(): boolean {
  return peekPwaInstallPrompt() !== null;
}

function getServerSnapshot(): boolean {
  return false;
}

export function usePwaInstallAvailable(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function usePwaStandalone(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === 'undefined') return () => {};
      const media = window.matchMedia('(display-mode: standalone)');
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    () => isDisplayStandalone(),
    () => false
  );
}

export function usePwaInstallDialogOpen(): boolean {
  return useSyncExternalStore(
    subscribePwaInstallDialog,
    peekPwaInstallDialogOpen,
    () => false
  );
}
