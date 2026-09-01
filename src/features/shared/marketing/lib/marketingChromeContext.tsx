'use client';

import { createContext, useContext, type ReactNode } from 'react';

import { useMarketingChrome } from '../hooks/useMarketingChrome';
import type { MarketingChromeData } from './loadMarketingChrome';

const MarketingChromeContext = createContext<MarketingChromeData | null>(null);

type MarketingChromeProviderProps = {
  initialChrome: MarketingChromeData;
  children: ReactNode;
};

/**
 * یک اشتراک کلاینت برای chrome لندینگ (محصول / بنر / شبکه اجتماعی).
 * بذر SSR اول رنگ می‌شود؛ localStorage موک + رویداد CMS بعد از mount تازه می‌شوند.
 */
export function MarketingChromeProvider({
  initialChrome,
  children,
}: MarketingChromeProviderProps) {
  const { data } = useMarketingChrome(initialChrome);
  return (
    <MarketingChromeContext.Provider value={data}>
      {children}
    </MarketingChromeContext.Provider>
  );
}

export function useMarketingChromeData(): MarketingChromeData {
  const value = useContext(MarketingChromeContext);
  if (!value) {
    throw new Error(
      'useMarketingChromeData must be used within MarketingChromeProvider'
    );
  }
  return value;
}
