import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AccountMenuOwner = 'header' | 'sidebar' | null;

interface UIState {
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  /** فقط یک منوی حساب (هدر یا سایدبار) هم‌زمان باز باشد. */
  accountMenuOwner: AccountMenuOwner;
}

interface UIActions {
  toggleSidebarCollapsed: () => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  setAccountMenuOwner: (owner: AccountMenuOwner) => void;
}

type UIStore = UIState & UIActions;

/**
 * chrome لحظه‌ای UI — جمع‌شدن سایدبار بعد از refresh می‌ماند؛
 * دراور موبایل و منوی حساب فقط همین نشست‌اند.
 */
export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      isMobileSidebarOpen: false,
      accountMenuOwner: null,
      toggleSidebarCollapsed: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      openMobileSidebar: () => set({ isMobileSidebarOpen: true }),
      closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
      setAccountMenuOwner: (owner) => set({ accountMenuOwner: owner }),
    }),
    {
      name: 'karvita-ui-store',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    }
  )
);
