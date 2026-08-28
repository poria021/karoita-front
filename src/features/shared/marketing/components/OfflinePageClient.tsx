'use client';

import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { PublicRouteStatusActions } from '@/components/shared/route-status/PublicRouteStatusActions';

export function OfflinePageClient() {
  return (
    <KvRouteStatus
      kind="offline"
      title="اتصال برقرار نیست"
      description="سامانه در این لحظه به شبکه دسترسی ندارد. شل برنامه برای استفادهٔ آفلاین ذخیره شده است؛ دادهٔ حساب و فهرست‌ها نیاز به ارتباط دارند."
      hint="پس از وصل شدن اینترنت، همین صفحه را نوسازی کنید یا به صفحه فرود بازگردید."
      actions={
        <PublicRouteStatusActions onReset={() => window.location.reload()} />
      }
    />
  );
}
