import type { Metadata } from 'next';

import { MarketingLoginSelectPage } from '@/features/shared/marketing/components/MarketingLoginSelectPage';
import { loadMarketingChromeServer } from '@/features/shared/marketing/lib/loadMarketingChromeServer';
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
  const initialChrome = await loadMarketingChromeServer();
  return <MarketingLoginSelectPage initialChrome={initialChrome} />;
}
