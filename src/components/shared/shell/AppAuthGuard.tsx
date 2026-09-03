'use client';

import { Suspense, useEffect, useState, type ReactNode } from 'react';

import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { PublicRouteStatusActions } from '@/components/shared/route-status/PublicRouteStatusActions';
import { KvBrandLinearLoader } from '@/components/shared/shell/KvBrandLinearLoader';
import { UnauthenticatedRedirect } from '@/components/shared/shell/UnauthenticatedRedirect';
import { AuthService } from '@/services/auth.service';
import { useAuthTransitionPhase } from '@/store/authTransition';
import { useUserStore } from '@/store/useUserStore';
import { isMockApiMode } from '@/lib/api-mode';
import { tryRestoreMockSession } from '@/services/auth/mock/mock-auth.store';
import { isSessionTransientError } from '@/services/auth/real/real-auth.bridge';
import {
  ensureAuthRestore,
  getRuntimeAuthBoot,
  resetRuntimeAuthBoot,
  type RuntimeAuthBoot,
} from '@/store/sessionBoot';
import type { Session } from '@/types/auth';

type BootState = 'pending' | RuntimeAuthBoot;

const BOOT_LABEL = 'لطفا منتظر بمانید…';

/** نگاشت refresh واقعی به boot — بدون حدس لاگین‌نشده روی خطای گذرا. */
export async function resolveRealAuthRestoreBoot(
  refresh: () => Promise<Session | null>
): Promise<RuntimeAuthBoot> {
  try {
    const restored = await refresh();
    if (restored) return 'authenticated';
  } catch (error) {
    if (isSessionTransientError(error)) return 'error';
  }
  return 'unauthenticated';
}

function BootLoader({ label = BOOT_LABEL }: { label?: string }) {
  return <KvBrandLinearLoader fullViewport label={label} />;
}

function RestoreErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <KvRouteStatus
      kind="offline"
      title="برقراری ارتباط با سرور ممکن نیست"
      description="نشست شما حفظ شده است. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید."
      hint="پس از وصل شدن ارتباط، تلاش مجدد را بزنید. خروج از حساب لازم نیست."
      actions={<PublicRouteStatusActions onReset={onRetry} />}
    />
  );
}

async function restoreSession(): Promise<RuntimeAuthBoot> {
  if (isMockApiMode()) {
    const quick = AuthService.validateSession();
    if (quick) return 'authenticated';
    const restored = tryRestoreMockSession();
    return restored ? 'authenticated' : 'unauthenticated';
  }

  const quick = AuthService.peekSession();
  if (quick) return 'authenticated';

  return resolveRealAuthRestoreBoot(() => AuthService.refreshRealSession());
}

function AppAuthGuardInner({ children }: { children: ReactNode }) {
  const hasHydrated = useUserStore((state) => state.hasHydrated);
  const activeUser = useUserStore((state) => state.activeUser);
  const phase = useAuthTransitionPhase();
  const [boot, setBoot] = useState<BootState>(
    () => getRuntimeAuthBoot() ?? 'pending'
  );

  useEffect(() => {
    if (getRuntimeAuthBoot()) return;
    if (!hasHydrated) return;

    let cancelled = false;
    void ensureAuthRestore(restoreSession).then((next) => {
      if (cancelled) return;
      setBoot(next);
    });

    return () => {
      cancelled = true;
    };
  }, [hasHydrated]);

  const retryRestore = () => {
    resetRuntimeAuthBoot();
    setBoot('pending');
    void ensureAuthRestore(restoreSession).then(setBoot);
  };

  if (phase === 'leaving') {
    return <BootLoader label="در حال خروج از حساب کاربری…" />;
  }

  if (boot === 'authenticated') {
    if (!activeUser) {
      return <BootLoader />;
    }
    return <>{children}</>;
  }

  if (boot === 'unauthenticated') {
    return (
      <Suspense fallback={<BootLoader />}>
        <UnauthenticatedRedirect />
      </Suspense>
    );
  }

  if (boot === 'error') {
    return <RestoreErrorScreen onRetry={retryRestore} />;
  }

  return <BootLoader />;
}

export function AppAuthGuard({ children }: { children: ReactNode }) {
  return <AppAuthGuardInner>{children}</AppAuthGuardInner>;
}
