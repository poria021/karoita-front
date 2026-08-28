import { Suspense, type ReactNode } from 'react';

import { AuthCardRouteFallback } from '@/features/shared/auth/components/AuthCardRouteFallback';

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <main
      className="kv-blueprint-bg flex min-h-dvh w-full items-center justify-center p-kv-inset"
      dir="rtl"
    >
      <Suspense fallback={<AuthCardRouteFallback />}>{children}</Suspense>
    </main>
  );
}
