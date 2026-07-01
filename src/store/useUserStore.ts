import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";

/**
 * Shape of the global user/session store.
 *
 * State and actions are kept in the same interface (a common Zustand
 * convention) since components typically select a slice of both via the
 * same hook call.
 */
interface UserStoreState {
  /** The currently signed-in user's profile, or `null` when signed out. */
  currentUser: User | null;
  /** Convenience flag derived from `currentUser`, kept explicit for fast checks. */
  isAuthenticated: boolean;
  /** Network connectivity flag, driven by `navigator.onLine`/socket heartbeats. */
  isOnline: boolean;

  /** Stores the authenticated user and flips `isAuthenticated` to `true`. */
  setUser: (user: User) => void;
  /** Clears the session, resetting `currentUser`/`isAuthenticated`. */
  logout: () => void;
  /** Updates the connectivity flag, e.g. from `window.on{line,offline}`. */
  setOnlineStatus: (status: boolean) => void;
}

/**
 * Removes fields that must never be persisted in client storage.
 *
 * Even if an upstream API mistakenly includes credential-like flags on the
 * `User` payload, the store sanitizes before it reaches persisted state.
 */
function sanitizeUserForClientStore(user: User): User {
  const sanitizedUser = { ...user };
  delete sanitizedUser.password;
  delete sanitizedUser.hasPassword;
  return sanitizedUser;
}

/**
 * Global User Store - single source of truth for "who is logged in" on the
 * client, backed by `zustand/middleware`'s `persist` so a page reload (or a
 * new tab) rehydrates the session instantly from `localStorage` instead of
 * flashing a logged-out state while the network request resolves.
 *
 * How components subscribe:
 *
 * Any component can call `useUserStore()` (or a selector form, see below)
 * directly - no `<Context.Provider>` wiring and no prop-drilling required.
 * Zustand keeps an internal subscriber list per store; when `setUser`/
 * `logout`/`setOnlineStatus` run, only the components whose *selected slice*
 * actually changed will re-render:
 *
 * ```tsx
 * // Re-renders only when `currentUser` changes, not on every store update.
 * const currentUser = useUserStore((state) => state.currentUser);
 *
 * // Actions are stable references, safe to destructure without re-renders.
 * const { setUser, logout } = useUserStore();
 * ```
 *
 * This is what makes Zustand preferable to prop-drilling here: any
 * component, at any depth, can read/react to session state without the
 * parent tree needing to know about it.
 */
export const useUserStore = create<UserStoreState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      isOnline: true,

      setUser: (user) =>
        set({
          currentUser: sanitizeUserForClientStore(user),
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          currentUser: null,
          isAuthenticated: false,
        }),

      setOnlineStatus: (status) => set({ isOnline: status }),
    }),
    {
      name: "karvita-session-storage",
      // Persist only cross-session auth data.
      // `isOnline` is an ephemeral runtime signal and must be recomputed from
      // browser/network events after boot, not restored from a previous tab.
      partialize: (state) => ({
        currentUser: state.currentUser
          ? sanitizeUserForClientStore(state.currentUser)
          : null,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
