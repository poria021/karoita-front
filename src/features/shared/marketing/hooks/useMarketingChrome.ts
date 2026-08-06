'use client';

import { useEffect, useState } from 'react';

import {
  invalidateLandingCmsMemory,
  LANDING_CMS_UPDATED_EVENT,
} from '@/services/landing-cms/mock-landing-cms.store';

import {
  loadMarketingChrome,
  type MarketingChromeData,
} from '../lib/loadMarketingChrome';

export { LANDING_CMS_UPDATED_EVENT };

const EMPTY_CHROME: MarketingChromeData = {
  banners: [],
  products: [],
  socials: [],
};

type MarketingChromeState = {
  data: MarketingChromeData;
  /** False until the first client read of Landing CMS completes. */
  isReady: boolean;
};

/**
 * Client-side marketing chrome from LandingCmsService (mock → localStorage).
 * RSC cannot see admin uploads; this is the public read path in mock mode.
 */
export function useMarketingChrome(): MarketingChromeState {
  const [state, setState] = useState<MarketingChromeState>({
    data: EMPTY_CHROME,
    isReady: false,
  });

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      const data = await loadMarketingChrome();
      if (!cancelled) {
        setState({ data, isReady: true });
      }
    };

    void refresh();

    const onStorage = (event: StorageEvent) => {
      if (event.key === 'karvita_mock_landing_cms_v1' || event.key === null) {
        invalidateLandingCmsMemory();
        void refresh();
      }
    };
    const onCmsUpdated = () => {
      // Same-tab write already updated memory; still re-list for consumers.
      void refresh();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener(LANDING_CMS_UPDATED_EVENT, onCmsUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(LANDING_CMS_UPDATED_EVENT, onCmsUpdated);
    };
  }, []);

  return state;
}
