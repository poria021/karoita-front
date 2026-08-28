import { create } from 'zustand';

import type { User } from '@/types/auth';

/**
 * کلید persist قدیمی. دیگر نوشته نمی‌شود؛ در boot پاک می‌شود تا PII/نقش
 * باقی‌مانده از بیلدهای قبلی در sessionStorage نماند.
 */
export const LEGACY_USER_STORE_STORAGE_KEY = 'karvita-user-store';

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

function removeStorageItem(
  storage: Pick<Storage, 'removeItem'>,
  key: string
): void {
  try {
    storage.removeItem(key);
  } catch {
    // private mode / blocked storage
  }
}

/** XSS می‌تواند Web Storage را بخواند — پروفایل کاربر هرگز آنجا نمی‌ماند. */
export function purgeLegacyUserStorePersistence(): void {
  if (typeof window === 'undefined') return;
  removeStorageItem(window.sessionStorage, LEGACY_USER_STORE_STORAGE_KEY);
  removeStorageItem(window.localStorage, LEGACY_USER_STORE_STORAGE_KEY);
}

purgeLegacyUserStorePersistence();

/**
 * استور نشست کلاینت (Zustand) — فقط حافظهٔ همین تب، برای chrome/UX.
 * منبع اختیار امنیتی نیست؛ authorization واقعی سمت Nest است.
 * نشست بعد از refresh از کوکی httpOnly + /auth/me (real) یا
 * کوکی session meta (mock) بازسازی می‌شود، نه از Web Storage.
 */
export const useUserStore = create<UserStore>((set) => ({
  activeUser: null,
  isAuthenticated: false,
  hasHydrated: false,
  setUser: (user) => set({ activeUser: user, isAuthenticated: user !== null }),
  setHasHydrated: (state) => set({ hasHydrated: state }),
}));
