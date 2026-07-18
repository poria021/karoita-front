import { Suspense } from 'react';

import HydrationSafe from '@/components/shared/HydrationSafe';
import { AdminGateCard } from '@/features/shared/auth/components/AdminGateCard';

function AdminGateFallback() {
  return (
    <div
      className="min-h-40 w-full max-w-md bg-transparent"
      aria-busy="true"
      aria-live="polite"
    />
  );
}

/**
 * Thin public route for senior-admin OTP gate.
 * Discoverable via `/auth/admin-gate` or `/auth/login?gate=admin`.
 */
export default function AdminGatePage() {
  return (
    <main
      className="kv-brand-atmosphere flex min-h-dvh w-full items-center justify-center p-kv-inset"
      dir="rtl"
    >
      <HydrationSafe>
        <Suspense fallback={<AdminGateFallback />}>
          <AdminGateCard />
        </Suspense>
      </HydrationSafe>
    </main>
  );
}
