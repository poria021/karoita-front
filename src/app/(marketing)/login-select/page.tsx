import type { Metadata } from 'next';

import { MarketingLoginSelectPage } from '@/features/shared/marketing/components/MarketingLoginSelectPage';
import { loadMarketingChrome } from '@/features/shared/marketing/lib/loadMarketingChrome';
import { DOCUMENT_TITLE } from '@/lib/document-title';
import { RouteService } from '@/services/route.service';

export const metadata: Metadata = {
  title: DOCUMENT_TITLE.systemsEntry,
  description: 'انتخاب محصول و ورود به سامانه‌های کارویتا.',
  alternates: {
    canonical: RouteService.marketing.loginSelect(),
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default async function MarketingLoginSelectRoute() {
  const initialChrome = await loadMarketingChrome();
  return <MarketingLoginSelectPage initialChrome={initialChrome} />;
}
