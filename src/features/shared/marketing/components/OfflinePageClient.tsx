'use client';

import { KvButton } from '@/components/shared/KvButton';
import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { RouteService } from '@/services/route.service';
import Link from 'next/link';

export function OfflinePageClient() {
  return (
    <KvRouteStatus
      kind="offline"
      title="اتصال برقرار نیست"
      description="سامانه در این لحظه به شبکه دسترسی ندارد. شل برنامه برای استفادهٔ آفلاین ذخیره شده است؛ دادهٔ حساب و فهرست‌ها نیاز به ارتباط دارند."
      hint="پس از وصل شدن اینترنت، همین صفحه را نوسازی کنید."
      actions={
        <>
          <KvButton
            type="button"
            color="cta"
            onClick={() => window.location.reload()}
          >
            تلاش مجدد
          </KvButton>
          <KvButton asChild appearance="secondary">
            <Link href={RouteService.marketing.home()} prefetch={false}>
              صفحه فرود
            </Link>
          </KvButton>
        </>
      }
    />
  );
}
