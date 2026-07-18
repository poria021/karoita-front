import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { User } from '@/types/auth';

/**
 * Global authentication state (rule 60, #16 — SSO). This is the single
 * source of truth for "who is the active user" across every domain.
 *
 * Client-only by design (rule 50, #1): never import or subscribe to this
 * store inside a React Server Component.
 *
 * Persisted `activeUser.role` is UX chrome only and can be forged in the
 * browser — never treat it as API authorization (rule 45 / 50 #5).
 */
interface UserState {
  activeUser: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
}

interface UserActions {
  setUser: (user: User | null) => void;
  setHasHydrated: (state: boolean) => void;
}

type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      activeUser: null,
      isAuthenticated: false,
      hasHydrated: false,
      setUser: (user) => set({ activeUser: user, isAuthenticated: user !== null }),
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: 'karvita-user-store',
      storage: createJSONStorage(() => localStorage),
      // Rule 50 (#2): prevent Next.js SSR hydration mismatches. Rehydration
      // must be triggered explicitly (`useUserStore.persist.rehydrate()`)
      // inside a client-only `useEffect`, e.g. from within `HydrationSafe`.
      skipHydration: true,
      partialize: (state) => ({
        activeUser: state.activeUser,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
