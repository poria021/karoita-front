'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

import { PwaInstallSuggestion } from '@/components/shared/shell/PwaInstallSuggestion';
import { shellCopy } from '@/components/shared/shell/shellCopy';
import { ensureBeforeInstallPromptCapture } from '@/lib/pwa/pwa-install';
import {
  PWA_SW_PRIMED_STORAGE_KEY,
  scheduleKarvitaServiceWorkerRegistration,
  shouldRegisterKarvitaServiceWorker,
  shouldReloadToPrimePwa,
  shouldUnregisterKarvitaServiceWorkerInDev,
  unregisterStaleKarvitaServiceWorkers,
} from '@/lib/pwa/register-pwa';

/**
 * ثبت SW بعد از اولین paint + گرفتن رویداد نصب Chrome.
 */
export function PwaBoot() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    ensureBeforeInstallPromptCapture();

    const canRegister = shouldRegisterKarvitaServiceWorker({
      nodeEnv: process.env.NODE_ENV,
      hasWindow: true,
      hasServiceWorker: 'serviceWorker' in navigator,
    });

    if (!canRegister) {
      if (
        shouldUnregisterKarvitaServiceWorkerInDev({
          nodeEnv: process.env.NODE_ENV,
          hasServiceWorker: 'serviceWorker' in navigator,
        })
      ) {
        void unregisterStaleKarvitaServiceWorkers();
      }
      return;
    }

    scheduleKarvitaServiceWorkerRegistration(async (scriptUrl) => {
      await navigator.serviceWorker.register(scriptUrl, { scope: '/' });
      await navigator.serviceWorker.ready;
      const primed = sessionStorage.getItem(PWA_SW_PRIMED_STORAGE_KEY) === '1';
      if (
        shouldReloadToPrimePwa({
          alreadyPrimed: primed,
          hasController: Boolean(navigator.serviceWorker.controller),
        })
      ) {
        sessionStorage.setItem(PWA_SW_PRIMED_STORAGE_KEY, '1');
        window.location.reload();
      } else if (!primed) {
        sessionStorage.setItem(PWA_SW_PRIMED_STORAGE_KEY, '1');
      }
    });

    let hadController = Boolean(navigator.serviceWorker.controller);
    const onControllerChange = () => {
      if (!hadController) {
        hadController = true;
        return;
      }
      toast.message(shellCopy.account.pwaUpdated, {
        action: {
          label: shellCopy.account.pwaReload,
          onClick: () => window.location.reload(),
        },
      });
    };
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      onControllerChange
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        'controllerchange',
        onControllerChange
      );
    };
  }, []);

  return <PwaInstallSuggestion />;
}
