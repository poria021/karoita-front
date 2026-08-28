'use client';

import { Suspense, useEffect, useState, type ReactNode } from 'react';

import { KvBrandLinearLoader } from '@/components/shared/shell/KvBrandLinearLoader';
import { UnauthenticatedRedirect } from '@/components/shared/shell/UnauthenticatedRedirect';
import { AuthService } from '@/services/auth.service';
import { useAuthTransitionPhase } from '@/store/authTransition';
import { useUserStore } from '@/store/useUserStore';
import { isMockApiMode } from '@/lib/api-mode';
import { tryRestoreMockSession } from '@/services/auth/mock/mock-auth.store';
import {
  ensureAuthRestore,
  getRuntimeAuthBoot,
  type RuntimeAuthBoot,
} from '@/store/sessionBoot';

type BootState = 'pending' | RuntimeAuthBoot;

const BOOT_LABEL = 'لطفا منتظر بمانید…';

function BootLoader({ label = BOOT_LABEL }: { label?: string }) {
  return <KvBrandLinearLoader fullViewport label={label} />;
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

  try {
    const restored = await AuthService.refreshRealSession();
    if (restored) return 'authenticated';
  } catch {
    // 401 → cookie expired
  }

  return 'unauthenticated';
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

  return <BootLoader />;
}

export function AppAuthGuard({ children }: { children: ReactNode }) {
  return <AppAuthGuardInner>{children}</AppAuthGuardInner>;
}
