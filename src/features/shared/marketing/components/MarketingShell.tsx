import type { ReactNode } from 'react';

import type { LandingProduct, LandingSocial } from '@/types/landing-cms';

import { MarketingPanelProvider } from '../lib/marketingPanelContext';
import { resolveMarketingLoginHref } from '../lib/marketingLinks';
import { MarketingFooter } from './MarketingFooter';
import { MarketingHeader } from './MarketingHeader';
import { MarketingProductsDock } from './MarketingProductsDock';

type MarketingShellProps = {
  products: LandingProduct[];
  socials: LandingSocial[];
  children: ReactNode;
  /** When true, header sits over the hero composition. */
  overlayHeader?: boolean;
};

/**
 * Public marketing chrome — RSC composition.
 * Interactive leaves: panel provider, dock, overlay header.
 */
export function MarketingShell({
  products,
  socials,
  children,
  overlayHeader = false,
}: MarketingShellProps) {
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
            overlayHeader ? '' : 'pt-14 lg:pt-16'
          }`}
        >
          {children}
        </main>

        <MarketingFooter socials={socials} />
      </div>
    </MarketingPanelProvider>
  );
}
