'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { KvButton } from '@/components/shared/KvButton';
import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { RouteService } from '@/services/route.service';

interface AuthErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AuthError({ error, reset }: AuthErrorProps) {
  useEffect(() => {
    console.error('Auth route error:', error);
  }, [error]);

  return (
    <KvRouteStatus
      kind="error"
      title="خطا در احراز هویت"
      description="بارگذاری این صفحه با اختلال مواجه شده است."
      hint="لطفاً مجدداً تلاش کنید یا به صفحه ورود بازگردید."
      actions={
        <>
          <KvButton type="button" color="cta" onClick={reset}>
            تلاش مجدد
          </KvButton>
          <KvButton asChild appearance="secondary">
            <Link href={RouteService.auth.login()} prefetch={false}>
              صفحه ورود
            </Link>
          </KvButton>
        </>
      }
    />
  );
}
