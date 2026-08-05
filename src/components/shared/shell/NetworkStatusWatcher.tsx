'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { useNetworkOnline } from '@/hooks/useNetworkOnline';

const OFFLINE_TOAST_ID = 'karvita-network-offline';

/**
 * Sticky bottom offline toast — no auto-timeout; stays until the user closes it.
 * Re-shows if the connection drops again after dismiss while still offline.
 */
export function NetworkStatusWatcher() {
  const online = useNetworkOnline();
  const prevOnlineRef = useRef(true);

  useEffect(() => {
    const justWentOffline = prevOnlineRef.current && !online;
    prevOnlineRef.current = online;

    if (!online && justWentOffline) {
      toast.error('اتصال اینترنت شما قطع است.', {
        id: OFFLINE_TOAST_ID,
        duration: Infinity,
        position: 'bottom-center',
        closeButton: true,
      });
    }
  }, [online]);

  return null;
}
