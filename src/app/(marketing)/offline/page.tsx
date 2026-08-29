import type { Metadata } from 'next';

import { OfflinePageClient } from '@/features/shared/marketing/components/OfflinePageClient';
import { DOCUMENT_TITLE, privatePageMetadata } from '@/lib/document-title';

export const metadata: Metadata = privatePageMetadata(DOCUMENT_TITLE.offline);

export default function OfflinePage() {
  return <OfflinePageClient />;
}
