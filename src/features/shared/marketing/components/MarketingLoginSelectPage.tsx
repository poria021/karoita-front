'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { MarketingLoginSelect } from '@/features/shared/marketing/components/MarketingLoginSelect';
import { useMarketingChrome } from '@/features/shared/marketing/hooks/useMarketingChrome';
import type { MarketingChromeData } from '@/features/shared/marketing/lib/loadMarketingChrome';
import { resolveMarketingLoginHref } from '@/features/shared/marketing/lib/marketingLinks';

type MarketingLoginSelectPageProps = {
  initialChrome: MarketingChromeData;
};

/**
 * پورتال ورود — تعداد محصول از Landing CMS. کمتر از دو → ورود auth.
 */
export function MarketingLoginSelectPage({
  initialChrome,
}: MarketingLoginSelectPageProps) {
  const router = useRouter();
  const { data, isReady } = useMarketingChrome(initialChrome);
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
