'use client';

import { useEffect } from 'react';

import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { PublicRouteStatusActions } from '@/components/shared/route-status/PublicRouteStatusActions';
import { reportError } from '@/lib/observability/reportError';

interface MarketingErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MarketingError({ error, reset }: MarketingErrorProps) {
  useEffect(() => {
    void reportError(error, {
      source: 'marketing-error',
      digest: error.digest,
    });
  }, [error]);

  return (
    <KvRouteStatus
      kind="error"
      title="خطا در بارگذاری صفحه"
      description="بارگذاری این صفحه با اختلال مواجه شده است."
      hint="لطفاً مجدداً تلاش کنید یا به صفحه فرود بازگردید."
      actions={<PublicRouteStatusActions onReset={reset} />}
    />
  );
}
