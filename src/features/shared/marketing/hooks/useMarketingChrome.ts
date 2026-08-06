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
