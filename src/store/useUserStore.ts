import { create } from "zustand";

// Future purpose: this store will hold the current User Profile & Session
// info (e.g. id, name, email, role, avatar) on the client, so components deep
// in the tree can read/update auth state without prop-drilling it down from
// the root layout. Actions like `setUser`/`clearUser` will be added once the
// session shape is finalized alongside Better Auth.
//
// Kept intentionally empty/base for now - just wiring up `create` from
// zustand as the setup base for Step 1 scaffolding.
export const useUserStore = create(() => ({}));
