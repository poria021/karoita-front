import { notFound } from 'next/navigation';

/**
 * Unmatched `/auth/*` URLs → auth `not-found` (and nearest recovers via RouteService).
 */
export default function AuthUnmatchedCatchAllPage() {
  notFound();
}
