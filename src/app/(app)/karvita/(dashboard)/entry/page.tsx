'use client';

import { useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';

import { getPostLoginPath } from '@/services/post-login-path';
import { useUserStore } from '@/store/useUserStore';

/**
 * Presence-only Edge lander. Resolves role/approval home on the client
 * via `getPostLoginPath` — never a lasting destination.
 */
export default function KarvitaEntryPage() {
  const router = useRouter();
  const activeUser = useUserStore((state) => state.activeUser);

  useLayoutEffect(() => {
    router.replace(getPostLoginPath(activeUser));
  }, [activeUser, router]);

  return (
    <div
      className="min-h-dvh w-full bg-kv-canvas"
      aria-busy="true"
      aria-live="polite"
    />
  );
}
