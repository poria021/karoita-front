'use client';

import { useEffect } from 'react';
import localFont from 'next/font/local';

import './globals.css';

import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { PublicRouteStatusActions } from '@/components/shared/route-status/PublicRouteStatusActions';
import { reportError } from '@/lib/observability/reportError';

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
    void reportError(error, {
      source: 'global-error',
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazirmatn.variable} bg-kv-canvas font-sans antialiased`}>
        <KvRouteStatus
          kind="error"
          title="خطای غیرمنتظره"
          description="بارگذاری برنامه با اختلال مواجه شده است."
          hint="لطفاً مجدداً تلاش کنید یا به صفحه فرود بازگردید."
          actions={<PublicRouteStatusActions onReset={reset} />}
        />
      </body>
    </html>
  );
}