'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { MarketingLoginSelect } from '@/features/shared/marketing/components/MarketingLoginSelect';
import { useMarketingChrome } from '@/features/shared/marketing/hooks/useMarketingChrome';
import { resolveMarketingLoginHref } from '@/features/shared/marketing/lib/marketingLinks';

/**
 * Login portal — product count from Landing CMS. Fewer than two → auth login.
 */
export function MarketingLoginSelectPage() {
  const router = useRouter();
  const { data, isReady } = useMarketingChrome();
  const products = data.products;

  useEffect(() => {
    if (!isReady) return;
    if (products.length < 2) {
      router.replace(resolveMarketingLoginHref(products.length));
    }
  }, [isReady, products.length, router]);

  if (!isReady || products.length < 2) {
    return (
      <div
        className="kv-brand-atmosphere kv-blueprint-bg min-h-dvh bg-kv-canvas"
        aria-busy="true"
        aria-live="polite"
      />
    );
  }

  return <MarketingLoginSelect products={products} />;
}
