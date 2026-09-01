import { create } from 'zustand';

/**
 * کش حافظهٔ ماژول‌های داشبورد برای بازدید مجدد SPA.
 * persist نمی‌شود (بدون توکن). سقف کلید جلوی رشد بی‌پایان نشست‌های طولانی را می‌گیرد.
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

/** سقف نرم کلیدهای لیست/داده (ترکیب جستجو × تب). */
const MAX_DATA_KEYS = 48;
/** سقف نرم chrome هر ماژول. */
const MAX_CHROME_KEYS = 24;

function setCappedRecord(
  record: Record<string, unknown>,
  key: string,
  value: unknown,
  maxKeys: number
): Record<string, unknown> {
  // کلید را ته رکورد می‌گذاریم تا به‌روز‌رسانی تازه‌ترین باشد (تقریباً LRU).
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
