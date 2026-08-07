'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import './globals.css';

import { KvButton } from '@/components/shared/KvButton';
import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { RouteService } from '@/services/route.service';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="fa" dir="rtl">
      <body className="bg-kv-canvas font-sans antialiased">
        <KvRouteStatus
          kind="error"
          title="خطای غیرمنتظره"
          description="بارگذاری برنامه با اختلال مواجه شده است."
          hint="لطفاً مجدداً تلاش کنید. در صورت تداوم مشکل، کمی بعد بازگردید."
          actions={
            <>
              <KvButton type="button" color="cta" onClick={reset}>
                تلاش مجدد
              </KvButton>
              <KvButton asChild appearance="secondary">
                <Link href={RouteService.marketing.home()} prefetch={false}>
                  صفحه اصلی
                </Link>
              </KvButton>
              <KvButton asChild color="neutral" appearance="text">
                <Link href={RouteService.auth.login()} prefetch={false}>
                  ورود
                </Link>
              </KvButton>
            </>
          }
        />
      </body>
    </html>
  );
}
