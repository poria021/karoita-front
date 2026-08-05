import { create } from 'zustand';

type NetworkStore = {
  /** Client connectivity (events + WAN/API probe). Driven by `network-status` monitor. */
  isOnline: boolean;
  setOnline: (isOnline: boolean) => void;
};

export const useNetworkStore = create<NetworkStore>()((set) => ({
  isOnline: true,
  setOnline: (isOnline) => set({ isOnline }),
}));
