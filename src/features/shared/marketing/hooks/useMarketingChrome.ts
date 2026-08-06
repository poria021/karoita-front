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
  /**
   * False only when no SSR seed was provided and the first client read
   * has not finished yet.
   */
  isReady: boolean;
};

/**
 * Marketing chrome from LandingCmsService.
 * Prefer `initialChrome` from RSC so first HTML is crawlable; client refresh
 * picks up mock localStorage admin edits after mount.
 */
export function useMarketingChrome(
  initialChrome?: MarketingChromeData
): MarketingChromeState {
  const [state, setState] = useState<MarketingChromeState>(() =>
    initialChrome
      ? { data: initialChrome, isReady: true }
      : { data: EMPTY_CHROME, isReady: false }
  );

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
