'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { KvButton } from '@/components/shared/KvButton';
import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { getPostLoginPath } from '@/services/post-login-path';
import { RouteService } from '@/services/route.service';
import { useUserStore } from '@/store/useUserStore';

interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: AppErrorProps) {
  const router = useRouter();

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
          <KvButton type="button" color="cta" onClick={reset}>
            تلاش مجدد
          </KvButton>
          <KvButton
            type="button"
            appearance="secondary"
            onClick={() =>
              router.push(getPostLoginPath(useUserStore.getState().activeUser))
            }
          >
            بازگشت به میز کار
          </KvButton>
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
