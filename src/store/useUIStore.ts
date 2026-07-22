import { create } from 'zustand';

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

export const useUIStore = create<UIStore>()((set) => ({
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,
  accountMenuOwner: null,
  toggleSidebarCollapsed: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  openMobileSidebar: () => set({ isMobileSidebarOpen: true }),
  closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
  setAccountMenuOwner: (owner) => set({ accountMenuOwner: owner }),
}));
