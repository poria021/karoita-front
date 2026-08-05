'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

import { useNetworkStore } from '@/store/useNetworkStore';

const OFFLINE_TOAST_ID = 'karvita-network-offline';

/**
 * Single owner of browser online/offline listeners (reference: setupNetworkAndDraftListeners).
 * Updates Zustand `isOnline` and surfaces sticky offline toast + recovery toast.
 */
export function NetworkStatusWatcher() {
  const setOnline = useNetworkStore((state) => state.setOnline);

  useEffect(() => {
    const syncFromNavigator = () => {
      setOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    };

    syncFromNavigator();

    const handleOnline = () => {
      setOnline(true);
      toast.dismiss(OFFLINE_TOAST_ID);
      toast.success('اتصال به اینترنت برقرار شد.', {
        id: 'karvita-network-online',
        position: 'bottom-center',
      });
    };

    const handleOffline = () => {
      setOnline(false);
      toast.dismiss('karvita-network-online');
      toast.error('اتصال اینترنت شما قطع است.', {
        id: OFFLINE_TOAST_ID,
        duration: Number.POSITIVE_INFINITY,
        position: 'bottom-center',
        closeButton: true,
        dismissible: true,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // If we landed already offline (e.g. DevTools Offline before load).
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);

  return null;
}
