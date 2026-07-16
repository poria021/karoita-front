import type { ReactNode } from 'react';

/**
 * Portal route group — shell comes from `/(app)/layout.tsx`.
 * Kept as a passthrough so portal pages can grow independently later.
 */
export default function PortalLayout({ children }: { children: ReactNode }) {
  return children;
}
