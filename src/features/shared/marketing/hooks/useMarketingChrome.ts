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
   * فقط وقتی بذر SSR نبوده و اولین خواندن کلاینت هنوز تمام نشده `false` است.
   */
  isReady: boolean;
};

/**
 * chrome مارکتینگ از `LandingCmsService`.
 * `initialChrome` از RSC را ترجیح بده تا HTML اول crawlپذیر باشد؛
 * refresh کلاینت ویرایش ادمین موک در localStorage را بعد از mount می‌گیرد.
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
