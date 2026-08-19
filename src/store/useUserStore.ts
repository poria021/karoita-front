import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { User } from '@/types/auth';

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

/**
 * استور نشست کلاینت (Zustand) — فقط برای chrome/UX.
 * منبع اختیار امنیتی نیست؛ authorization واقعی سمت Nest است.
 */
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
      storage: createJSONStorage(() => sessionStorage),
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