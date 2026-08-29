import type { Metadata } from 'next';

import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { AppRouteStatusActions } from '@/components/shared/route-status/AppRouteStatusActions';
import { DOCUMENT_TITLE, privatePageMetadata } from '@/lib/document-title';

export const metadata: Metadata = privatePageMetadata(DOCUMENT_TITLE.notFound);

/** In-shell 404 for `notFound()` under `/(app)` (keeps Header/Sidebar).
 * Unmatched `/karvita/*` URLs reach this via `karvita/[...notFound]/page.tsx`.
 */
export default function AppNotFound() {
  return (
    <KvRouteStatus
      kind="notFound"
      layout="inset"
      title="صفحه مورد نظر یافت نشد"
      description="این مسیر در سامانه وجود ندارد یا امکان دسترسی به آن فراهم نیست."
      hint="از منو مسیر صحیح را انتخاب نمایید یا به میز کار بازگردید."
      actions={<AppRouteStatusActions />}
    />
  );
}
