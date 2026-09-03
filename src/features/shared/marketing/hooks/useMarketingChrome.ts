'use client';

import { useEffect, useState } from 'react';

import { LandingCmsService } from '@/services/landing-cms.service';

import {
  loadMarketingChrome,
  type MarketingChromeData,
} from '../lib/loadMarketingChrome';

const EMPTY_CHROME: MarketingChromeData = {
  banners: [],
  products: [],
  socials: [],
};

type MarketingChromeState = {
  data: MarketingChromeData;
  /** `false` until the client has finished its first hydration-aware read. */
  isReady: boolean;
};

/**
 * Load marketing chrome from a cached client source and prefer the SSR seed when present.
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

    const unsubscribe = LandingCmsService.subscribeChromeChanges(() => {
      void refresh();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return state;
}
