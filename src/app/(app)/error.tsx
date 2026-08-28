'use client';

import { useEffect } from 'react';

import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { AppRouteStatusActions } from '@/components/shared/route-status/AppRouteStatusActions';
import { reportError } from '@/lib/observability/reportError';

interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: AppErrorProps) {
  useEffect(() => {
    void reportError(error, {
      source: 'app-error',
      digest: error.digest,
    });
  }, [error]);

  return (
    <KvRouteStatus
      kind="error"
      layout="inset"
      title="خطا در بارگذاری صفحه"
      description="در دریافت اطلاعات این بخش اختلالی رخ داده است."
      hint="لطفاً مجدداً تلاش کنید. در صورت تداوم مشکل به میز کار بازگردید."
      actions={<AppRouteStatusActions onReset={reset} />}
    />
  );
}
