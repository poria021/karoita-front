import type { ReactNode } from 'react';

import { AuthCardHost } from '@/features/shared/auth/components/AuthCardHost';

/**
 * بوم مشترک `/auth/login`، `/auth/register`، `/auth/forgot`.
 *
 * خود کارت داخل `AuthCardHost` است تا لوگو و فرم با هم SSR شوند.
 * میزبان روی layout می‌ماند تا عوض شدن تب فرم را خالی نکند.
 */
export default function AuthCardGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main
      className="kv-blueprint-bg flex min-h-dvh w-full justify-center items-center p-kv-inset"
      dir="rtl"
    >
      <AuthCardHost />
      {children}
    </main>
  );
}
