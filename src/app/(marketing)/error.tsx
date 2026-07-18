'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { RouteService } from '@/services/route.service';
import { faIcons } from '@/utils/iconMap';

interface MarketingErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/** Error boundary for public marketing routes. */
export default function MarketingError({ error, reset }: MarketingErrorProps) {
  useEffect(() => {
    console.error('Marketing route error:', error);
  }, [error]);

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center"
      dir="rtl"
    >
      <div className="flex size-12 items-center justify-center rounded-kv-panel bg-kv-danger-soft text-kv-danger">
        <FaIcon icon={faIcons.triangleExclamation} size="lg" />
      </div>
      <div className="space-y-2">
        <h2 className="text-sm font-black text-kv-text">خطا در بارگذاری صفحه</h2>
        <p className="max-w-md text-xs font-bold text-kv-text-subtle">
          لطفاً دوباره تلاش کنید یا به صفحه اصلی بازگردید.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
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
      </div>
    </div>
  );
}
