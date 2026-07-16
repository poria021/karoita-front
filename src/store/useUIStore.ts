import { create } from 'zustand';

/**
 * Shared, non-persisted UI chrome state (rule 60, #5: cross-cutting UI state
 * like sidebar collapse/open belongs in a Zustand store, not local component
 * state, since both `Header.tsx` and `Sidebar.tsx` must react to the same
 * toggle without prop-drilling between sibling layout components).
 */
interface UIState {
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
}

interface UIActions {
  toggleSidebarCollapsed: () => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()((set) => ({
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,
  toggleSidebarCollapsed: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  openMobileSidebar: () => set({ isMobileSidebarOpen: true }),
  closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
}));
