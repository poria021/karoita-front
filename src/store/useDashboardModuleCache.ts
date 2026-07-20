import { create } from 'zustand';

/**
 * In-memory cache for Karvita dashboard modules (SPA revisit).
 * Not persisted — no tokens/secrets. See rule 83.
 */
type DashboardModuleCacheState = {
  data: Record<string, unknown>;
  chrome: Record<string, unknown>;
  getData: <T>(key: string) => T | undefined;
  setData: <T>(key: string, value: T) => void;
  getChrome: <T>(moduleId: string) => T | undefined;
  setChrome: <T>(moduleId: string, value: T) => void;
  invalidatePrefix: (prefix: string) => void;
};

export const useDashboardModuleCache = create<DashboardModuleCacheState>(
  (set, get) => ({
    data: {},
    chrome: {},
    getData: <T,>(key: string) => get().data[key] as T | undefined,
    setData: <T,>(key: string, value: T) =>
      set((state) => ({
        data: { ...state.data, [key]: value },
      })),
    getChrome: <T,>(moduleId: string) =>
      get().chrome[moduleId] as T | undefined,
    setChrome: <T,>(moduleId: string, value: T) =>
      set((state) => ({
        chrome: { ...state.chrome, [moduleId]: value },
      })),
    invalidatePrefix: (prefix: string) =>
      set((state) => {
        const data = { ...state.data };
        for (const key of Object.keys(data)) {
          if (key.startsWith(prefix)) delete data[key];
        }
        return { data };
      }),
  })
);

export function dashboardListCacheKey(
  namespace: string,
  resetKey: string
): string {
  return `${namespace}::${resetKey}`;
}
