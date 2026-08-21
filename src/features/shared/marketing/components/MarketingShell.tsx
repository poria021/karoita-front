'use client';

import type { ReactNode } from 'react';

import {
  MarketingChromeProvider,
  useMarketingChromeData,
} from '../lib/marketingChromeContext';
import type { MarketingChromeData } from '../lib/loadMarketingChrome';
import { MarketingPanelProvider } from '../lib/marketingPanelContext';
import { resolveMarketingLoginHref } from '../lib/marketingLinks';
import { MarketingFooter } from './MarketingFooter';
import { MarketingHeader } from './MarketingHeader';
import { MarketingProductsDock } from './MarketingProductsDock';

type MarketingShellProps = {
  /** SSR chrome seed — client rehydrates from Landing CMS (mock localStorage). */
  initialChrome: MarketingChromeData;
  children: ReactNode;
  /** When true, header sits over the hero composition. */
  overlayHeader?: boolean;
};

function MarketingShellChrome({
  children,
  overlayHeader,
}: {
  children: ReactNode;
  overlayHeader: boolean;
}) {
  const { products, socials } = useMarketingChromeData();
  const loginHref = resolveMarketingLoginHref(products.length);

  return (
    <MarketingPanelProvider>
      <div
        className="kv-brand-atmosphere kv-blueprint-bg relative flex min-h-dvh w-full flex-col"
        dir="rtl"
      >
        <MarketingProductsDock products={products} />
        <MarketingHeader loginHref={loginHref} overlayHeader={overlayHeader} />

        <main
          className={`flex w-full flex-1 flex-col ${
            overlayHeader ? 'pt-14 lg:pt-0' : 'pt-14 lg:pt-16'
          }`}
        >
          {children}
        </main>

        <MarketingFooter socials={socials} />
      </div>
    </MarketingPanelProvider>
  );
}

/**
 * Public marketing chrome — client leaf so dock / footer / login CTA
 * track Landing CMS after admin edits (RSC seed alone is server-seed only).
 */
export function MarketingShell({
  initialChrome,
  children,
  overlayHeader = false,
}: MarketingShellProps) {
  return (
    <MarketingChromeProvider initialChrome={initialChrome}>
      <MarketingShellChrome overlayHeader={overlayHeader}>
        {children}
      </MarketingShellChrome>
    </MarketingChromeProvider>
  );
}
