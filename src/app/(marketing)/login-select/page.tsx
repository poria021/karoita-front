import { redirect } from 'next/navigation';

import { MarketingLoginSelect } from '@/features/shared/marketing/components/MarketingLoginSelect';
import { loadMarketingChrome } from '@/features/shared/marketing/lib/loadMarketingChrome';
import { resolveMarketingLoginHref } from '@/features/shared/marketing/lib/marketingLinks';

export default async function MarketingLoginSelectPage() {
  const { products } = await loadMarketingChrome();

  // Single (or zero) product → skip picker and go straight to auth login.
  if (products.length <= 1) {
    redirect(resolveMarketingLoginHref(products.length));
  }

  return <MarketingLoginSelect products={products} />;
}
