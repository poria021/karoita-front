import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import HydrationSafe from '@/components/shared/shell/HydrationSafe';
import { AuthCard } from '@/features/shared/auth/components/AuthCard';
import { isAdminAppSurface } from '@/lib/config';
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

function redirectToAdminGate(returnUrl?: string): never {
  const adminGate = RouteService.auth.adminGate();
  const safeReturn = parseSafeReturnUrl(returnUrl);
  if (safeReturn) {
    redirect(
      `${adminGate}?${RETURN_URL_PARAM}=${encodeURIComponent(safeReturn)}`
    );
  }
  redirect(adminGate);
}

/**
 * Public login. `?gate=admin` mirrors original-karvita.html discovery and
 * redirects to the standalone admin OTP gate (preserves safe returnUrl).
 * On `NEXT_PUBLIC_APP_SURFACE=admin`, always redirect to the admin gate.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  if (isAdminAppSurface() || params.gate === 'admin') {
    redirectToAdminGate(params.returnUrl);
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
