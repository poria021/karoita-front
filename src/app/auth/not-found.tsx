import type { Metadata } from 'next';

import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { PublicRouteStatusActions } from '@/components/shared/route-status/PublicRouteStatusActions';
import { DOCUMENT_TITLE, privatePageMetadata } from '@/lib/document-title';

export const metadata: Metadata = privatePageMetadata(DOCUMENT_TITLE.notFound);

export default function AuthNotFound() {
  return (
    <KvRouteStatus
      kind="notFound"
      title="صفحه مورد نظر یافت نشد"
      description="این مسیر احراز هویت در سامانه تعریف نشده است."
      hint="می‌توانید به صفحه فرود بازگردید."
      actions={<PublicRouteStatusActions />}
    />
  );
}
