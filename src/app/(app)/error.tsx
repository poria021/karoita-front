'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { KvButton } from '@/components/shared/KvButton';
import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { AppRouteStatusActions } from '@/components/shared/route-status/AppRouteStatusActions';
import { RouteService } from '@/services/route.service';

interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: AppErrorProps) {
  useEffect(() => {
    console.error('App route error:', error);
  }, [error]);

  return (
    <KvRouteStatus
      kind="error"
      layout="inset"
      title="خطا در بارگذاری صفحه"
      description="در دریافت اطلاعات این بخش اختلالی رخ داده است."
      hint="لطفاً مجدداً تلاش کنید. در صورت تداوم مشکل به میز کار بازگردید."
      actions={
        <>
          <AppRouteStatusActions onReset={reset} />
          <KvButton asChild color="neutral" appearance="text">
            <Link href={RouteService.auth.login()} prefetch={false}>
              صفحه ورود
            </Link>
          </KvButton>
        </>
      }
    />
  );
}
