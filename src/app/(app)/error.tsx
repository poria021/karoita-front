'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { getPostLoginPath } from '@/services/post-login-path';
import { RouteService } from '@/services/route.service';
import { useUserStore } from '@/store/useUserStore';
import { faIcons } from '@/utils/iconMap';

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
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center"
      dir="rtl"
    >
      <div className="flex size-12 items-center justify-center rounded-kv-panel bg-kv-danger-soft text-kv-danger">
        <FaIcon icon={faIcons.triangleExclamation} size="lg" />
      </div>
      <div className="space-y-2">
        <h2 className="text-sm font-black text-kv-text">
          خطایی در بارگذاری صفحه رخ داد
        </h2>
        <p className="max-w-md text-xs font-bold text-kv-text-subtle">
          لطفاً دوباره تلاش کنید. اگر مشکل ادامه داشت، به میز کار بازگردید.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <KvButton type="button" color="cta" appearance="solid" onClick={reset}>
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
      </div>
    </div>
  );
}
