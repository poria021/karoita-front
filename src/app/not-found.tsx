import type { Metadata } from 'next';

import { PublicNotFoundStatus } from '@/components/shared/route-status/PublicNotFoundStatus';
import { DOCUMENT_TITLE, privatePageMetadata } from '@/lib/document-title';

export const metadata: Metadata = privatePageMetadata(DOCUMENT_TITLE.notFound);

export default function RootNotFound() {
  return <PublicNotFoundStatus />;
}
