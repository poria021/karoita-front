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
 * One client subscription for landing chrome (products / banners / socials).
 * SSR seed paints first; mock localStorage + CMS events refresh after mount.
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
