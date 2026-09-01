import { create } from 'zustand';

/**
 * In-memory cache for Karvita dashboard modules (SPA revisit).
 * Not persisted — no tokens/secrets. In-memory only for SPA revisit.
 *
 * Caps entry count so long SPA sessions (many tab/search keys) cannot grow without bound.
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

/** Soft max for list/data keys (search × tab combinations). */
const MAX_DATA_KEYS = 48;
/** Soft max for per-module chrome blobs. */
const MAX_CHROME_KEYS = 24;

function setCappedRecord(
  record: Record<string, unknown>,
  key: string,
  value: unknown,
  maxKeys: number
): Record<string, unknown> {
  // Re-insert key at the end so updates count as most-recent (LRU-ish).
  const { [key]: _removed, ...rest } = record;
  void _removed;
  const next: Record<string, unknown> = { ...rest, [key]: value };
  const keys = Object.keys(next);
  if (keys.length <= maxKeys) return next;

  const excess = keys.length - maxKeys;
  for (let i = 0; i < excess; i += 1) {
    delete next[keys[i]];
  }
  return next;
}

export const useDashboardModuleCache = create<DashboardModuleCacheState>(
  (set, get) => ({
    data: {},
    chrome: {},
    getData: <T,>(key: string) => get().data[key] as T | undefined,
    setData: <T,>(key: string, value: T) =>
      set((state) => ({
        data: setCappedRecord(state.data, key, value, MAX_DATA_KEYS),
      })),
    getChrome: <T,>(moduleId: string) =>
      get().chrome[moduleId] as T | undefined,
    setChrome: <T,>(moduleId: string, value: T) =>
      set((state) => ({
        chrome: setCappedRecord(state.chrome, moduleId, value, MAX_CHROME_KEYS),
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
