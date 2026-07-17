'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TriangleAlert } from 'lucide-react';

import { KvButton } from '@/components/shared/KvButton';
import { RouteService } from '@/services/route.service';

interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Dashboard-root error boundary (rule 20). Intercepts client/server render
 * crashes under `/(app)` and offers a localized recovery path.
 */
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
      <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
        <TriangleAlert className="size-6" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h2 className="text-sm font-black text-slate-900">
          خطایی در بارگذاری صفحه رخ داد
        </h2>
        <p className="max-w-md text-xs font-bold text-slate-500">
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
          onClick={() => router.push(RouteService.karvita.dashboard())}
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
