'use client';

import { useEffect } from 'react';

import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { PublicRouteStatusActions } from '@/components/shared/route-status/PublicRouteStatusActions';
import { reportError } from '@/lib/observability/reportError';

interface AuthErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AuthError({ error, reset }: AuthErrorProps) {
  useEffect(() => {
    void reportError(error, {
      source: 'auth-error',
      digest: error.digest,
    });
  }, [error]);

  return (
    <KvRouteStatus
      kind="error"
      title="خطا در احراز هویت"
      description="بارگذاری این صفحه با اختلال مواجه شده است."
      hint="لطفاً مجدداً تلاش کنید یا به صفحه فرود بازگردید."
      actions={<PublicRouteStatusActions onReset={reset} />}
    />
  );
}
