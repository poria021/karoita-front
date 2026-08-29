import { KarvitaEntryRedirect } from '@/features/karvita/dashboard/components/KarvitaEntryRedirect';
import { DOCUMENT_TITLE, privatePageMetadata } from '@/lib/document-title';

export const metadata = privatePageMetadata(DOCUMENT_TITLE.appEntry);

export default function KarvitaEntryRoutePage() {
  return <KarvitaEntryRedirect />;
}
