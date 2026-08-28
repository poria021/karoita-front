'use client';

import { useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';

import { KvBrandLinearLoader } from '@/components/shared/shell/KvBrandLinearLoader';
import { getPostLoginPath } from '@/services/post-login-path';
import { useUserStore } from '@/store/useUserStore';

/**
 * Presence-only Edge lander. Resolves role/approval home on the client
 * via `getPostLoginPath` — never a lasting destination.
 */
export function KarvitaEntryRedirect() {
  const router = useRouter();
  const activeUser = useUserStore((state) => state.activeUser);

  useLayoutEffect(() => {
    router.replace(getPostLoginPath(activeUser));
  }, [activeUser, router]);

  return <KvBrandLinearLoader fullViewport label="لطفا منتظر بمانید…" />;
}
