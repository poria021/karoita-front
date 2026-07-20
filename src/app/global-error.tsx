'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { RouteService } from '@/services/route.service';
import { faIcons } from '@/utils/iconMap';

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
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-kv-panel bg-kv-danger-soft text-kv-danger">
            <FaIcon icon={faIcons.triangleExclamation} size="lg" />
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-black text-kv-text">خطای غیرمنتظره</h2>
            <p className="max-w-md text-xs font-bold text-kv-text-subtle">
              بارگذاری برنامه با مشکل مواجه شد. لطفاً دوباره تلاش کنید.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <KvButton type="button" color="cta" onClick={reset}>
              تلاش مجدد
            </KvButton>
            <KvButton asChild color="neutral" appearance="text">
              <Link href={RouteService.marketing.home()} prefetch={false}>
                صفحه اصلی
              </Link>
            </KvButton>
            <KvButton asChild color="neutral" appearance="text">
              <Link href={RouteService.auth.login()} prefetch={false}>
                ورود
              </Link>
            </KvButton>
          </div>
        </div>
      </body>
    </html>
  );
}
