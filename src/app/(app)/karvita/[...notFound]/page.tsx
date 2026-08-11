import { notFound } from 'next/navigation';

/**
 * Unmatched `/karvita/*` URLs do not hit `(app)/not-found.tsx` by themselves
 * (Next serves root `app/not-found` outside the shell). This catch-all matches
 * inside `(app)/layout` then throws `notFound()` so the inset status UI keeps
 * Header/Sidebar.
 */
export default function KarvitaUnmatchedCatchAllPage() {
  notFound();
}
