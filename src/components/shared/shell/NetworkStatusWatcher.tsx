'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

import {
  NETWORK_OFFLINE_TOAST_ID,
  NETWORK_ONLINE_TOAST_ID,
  clearNetworkToastHandlers,
  ensureNetworkMonitoring,
} from '@/lib/network-status';

/**
 * Boots online/offline monitor + sticky offline toast.
 * Mount only inside the dashboard/(app) shell — not marketing or auth.
 */
export function NetworkStatusWatcher() {
  useEffect(() => {
    ensureNetworkMonitoring({
      onOffline: () => {
        toast.dismiss(NETWORK_ONLINE_TOAST_ID);
        toast.error('اتصال اینترنت شما قطع است.', {
          id: NETWORK_OFFLINE_TOAST_ID,
          duration: Number.POSITIVE_INFINITY,
          position: 'top-center',
          closeButton: true,
          dismissible: true,
        });
      },
      onOnline: () => {
        toast.dismiss(NETWORK_OFFLINE_TOAST_ID);
        toast.success('اتصال به اینترنت برقرار شد.', {
          id: NETWORK_ONLINE_TOAST_ID,
          position: 'top-center',
        });
      },
    });

    return () => {
      clearNetworkToastHandlers();
      toast.dismiss(NETWORK_OFFLINE_TOAST_ID);
      toast.dismiss(NETWORK_ONLINE_TOAST_ID);
    };
  }, []);

  return null;
}
