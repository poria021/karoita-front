import { Suspense } from 'react';

import { AuthCardRouteFallback } from '@/features/shared/auth/components/AuthCardRouteFallback';
import { AuthCard } from '@/features/shared/auth/components/AuthCard';
import {
  redirectLoginToAdminGate,
  shouldRedirectLoginToAdminGate,
} from '@/features/shared/auth/lib/resolveLoginRedirect';

interface LoginRoutePageProps {
  searchParams: Promise<{ gate?: string; returnUrl?: string }>;
}

export default async function LoginRoutePage({
  searchParams,
}: LoginRoutePageProps) {
  const params = await searchParams;

  if (shouldRedirectLoginToAdminGate(params)) {
    redirectLoginToAdminGate(params.returnUrl);
  }

  return (
    <main
      className="kv-blueprint-bg flex min-h-dvh w-full items-center justify-center p-kv-inset"
      dir="rtl"
    >
      <Suspense fallback={<AuthCardRouteFallback />}>
        <AuthCard defaultTab="login" />
      </Suspense>
    </main>
  );
}
