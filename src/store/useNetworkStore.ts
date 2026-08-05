import { create } from 'zustand';

type NetworkStore = {
  /** Mirror of browser connectivity — same role as Alpine `isOnline` in reference HTML. */
  isOnline: boolean;
  setOnline: (isOnline: boolean) => void;
};

export const useNetworkStore = create<NetworkStore>()((set) => ({
  isOnline: true,
  setOnline: (isOnline) => set({ isOnline }),
}));
