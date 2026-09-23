'use client';

import { useEffect, useState } from 'react';

import { isMockApiMode } from '@/lib/api-mode';
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
 *
 * در real mode، endpoint بنرها admin-only است و از مرورگر بدون auth قابل دسترس
 * نیست. پس اگر SSR seed (initialChrome) وجود داشت، client-side refresh انجام
 * نمی‌دهیم تا مقدار SSR با آرایه خالی overwrite نشود.
 * وقتی Nest یک endpoint عمومی برای لندینگ ارائه داد، این guard را بردارید.
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
    // در real mode با SSR seed، client-side refetch نمی‌کنیم (endpoint عمومی ندارد).
    const mockMode = isMockApiMode();
    if (!mockMode && initialChrome) return;

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
