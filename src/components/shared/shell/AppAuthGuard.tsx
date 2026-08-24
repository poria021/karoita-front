'use client';

import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { DashboardAccessPlaceholder } from '@/components/shared/shell/DashboardAccessPlaceholder';
import { AuthService } from '@/services/auth.service';
import { RouteService } from '@/services/route.service';
import { buildLoginHref } from '@/lib/return-url';
import { useUserStore } from '@/store/useUserStore';
import { isMockApiMode } from '@/lib/api-mode';

type BootState = 'pending' | 'authenticated' | 'unauthenticated';

function AppAuthGuardInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasHydrated = useUserStore((state) => state.hasHydrated);
  const [boot, setBoot] = useState<BootState>('pending');
  const booted = useRef(false);

  useEffect(() => {
    if (!hasHydrated || booted.current) return;
    booted.current = true;

    async function tryRestoreSession() {
      // ─── Mock mode: فقط store/cookie چک می‌شود، هیچ refresh network نداریم ───
      if (isMockApiMode()) {
        const valid = AuthService.validateSession();
        setBoot(valid ? 'authenticated' : 'unauthenticated');
        return;
      }

      // ─── Real mode ────────────────────────────────────────────────────────────

      // ۱. memory همین تب session داره → سریع تأیید کن، cookie را دست نزن
      const quick = AuthService.peekSession();
      if (quick) {
        setBoot('authenticated');
        return;
      }

      // ۲. memory خالیه (tab reload / بازگشت از لندینگ) → refresh از httpOnly cookie
      //    عمداً validateSession() صدا نمی‌زنیم چون clearRealAuthTokens() صدا می‌کند
      //    و cookie را قبل از refresh پاک می‌کند.
      try {
        const restored = await AuthService.refreshRealSession();
        if (restored) {
          setBoot('authenticated');
          return;
        }
      } catch {
        // 401 → cookie منقضی
      }

      // ۳. هیچ session ای نیست → redirect به login
      setBoot('unauthenticated');
    }

    void tryRestoreSession();
  }, [hasHydrated]);

  useEffect(() => {
    if (boot !== 'unauthenticated') return;
    const search = searchParams.toString();
    const intended = search ? `${pathname}?${search}` : pathname;
    router.replace(buildLoginHref(RouteService.auth.login(), intended));
  }, [boot, pathname, router, searchParams]);

  if (boot !== 'authenticated') {
    return <DashboardAccessPlaceholder fullViewport />;
  }

  return <>{children}</>;
}

export function AppAuthGuard({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<DashboardAccessPlaceholder fullViewport />}>
      <AppAuthGuardInner>{children}</AppAuthGuardInner>
    </Suspense>
  );
}
