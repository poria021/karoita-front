'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import localFont from 'next/font/local';

import './globals.css';

import { KvButton } from '@/components/shared/KvButton';
import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { RouteService } from '@/services/route.service';

const vazirmatn = localFont({
  src: [
    {
      path: '../fonts/vazirmatn/vazirmatn-arabic-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/vazirmatn/vazirmatn-arabic-700-normal.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-vazirmatn',
  display: 'swap',
});

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
      <body className={`${vazirmatn.variable} bg-kv-canvas font-sans antialiased`}>
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
                  صفحه فرود
                </Link>
              </KvButton>
            </>
          }
        />
      </body>
    </html>
  );
}