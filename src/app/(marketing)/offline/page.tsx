import type { Metadata } from 'next';

import { OfflinePageClient } from '@/features/shared/marketing/components/OfflinePageClient';
import { SITE_NAME } from '@/lib/site-seo';

export const metadata: Metadata = {
  title: `آفلاین | ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return <OfflinePageClient />;
}
