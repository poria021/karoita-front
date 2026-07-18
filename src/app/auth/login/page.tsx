import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import HydrationSafe from '@/components/shared/HydrationSafe';
import { AuthCard } from '@/features/shared/auth/components/AuthCard';
import { RETURN_URL_PARAM, parseSafeReturnUrl } from '@/lib/return-url';
import { RouteService } from '@/services/route.service';

interface LoginPageProps {
  searchParams: Promise<{ gate?: string; returnUrl?: string }>;
}

function AuthCardFallback() {
  return (
    <div
      className="min-h-40 w-full max-w-md bg-transparent"
      aria-busy="true"
      aria-live="polite"
    />
  );
}

/**
 * Public login. `?gate=admin` mirrors original-karvita.html discovery and
 * redirects to the standalone admin OTP gate (preserves safe returnUrl).
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  if (params.gate === 'admin') {
    const adminGate = RouteService.auth.adminGate();
    const safeReturn = parseSafeReturnUrl(params.returnUrl);
    if (safeReturn) {
      redirect(
        `${adminGate}?${RETURN_URL_PARAM}=${encodeURIComponent(safeReturn)}`
      );
    }
    redirect(adminGate);
  }

  return (
    <main
      className="kv-brand-atmosphere flex min-h-dvh w-full items-center justify-center p-kv-inset"
      dir="rtl"
    >
      <HydrationSafe>
        <Suspense fallback={<AuthCardFallback />}>
          <AuthCard defaultTab="login" />
        </Suspense>
      </HydrationSafe>
    </main>
  );
}
