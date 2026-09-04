import { keepLocalIdentityPreview } from '@/services/auth/keep-local-identity-preview';
import { setRuntimeAuthBoot } from '@/store/sessionBoot';
import { useUserStore } from '@/store/useUserStore';
import type { Session } from '@/types/auth';

/**
 * همگام‌سازی سشن با Zustand — مشترک mock و real.
 * ماندگاری mock (cookie / localStorage) فقط در `mock-auth.store` است.
 */
export function dispatchSessionToStore(session: Session | null): void {
  const store = useUserStore.getState();
  if (!session) {
    store.setUser(null);
  } else {
    store.setUser(keepLocalIdentityPreview(store.activeUser, session.user));
  }

  if (session) {
    store.setHasHydrated(true);
    setRuntimeAuthBoot('authenticated');
  } else {
    setRuntimeAuthBoot('unauthenticated');
  }
}
