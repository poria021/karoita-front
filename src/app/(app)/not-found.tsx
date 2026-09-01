import type { Metadata } from 'next';

import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { AppRouteStatusActions } from '@/components/shared/route-status/AppRouteStatusActions';
import { DOCUMENT_TITLE, privatePageMetadata } from '@/lib/document-title';

export const metadata: Metadata = privatePageMetadata(DOCUMENT_TITLE.notFound);

/**
 * ۴۰۴ داخل شِل برای `notFound()` زیر `/(app)` (Header/Sidebar می‌ماند).
 * URL بی‌تطبیق `/karvita/*` از `karvita/[...notFound]/page.tsx` به اینجا می‌رسد.
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
