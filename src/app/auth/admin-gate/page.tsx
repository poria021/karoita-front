import { Suspense } from 'react';

import { AdminGateCard } from '@/features/shared/auth/components/AdminGateCard';
import { AuthCardRouteFallback } from '@/features/shared/auth/components/AuthCardRouteFallback';

export default function AdminGatePage() {
  return (
    <main
      className="kv-blueprint-bg flex min-h-dvh w-full items-center justify-center p-kv-inset"
      dir="rtl"
    >
      <Suspense fallback={<AuthCardRouteFallback />}>
        <AdminGateCard />
      </Suspense>
    </main>
  );
}
