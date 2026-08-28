import { notFound } from 'next/navigation';

/**
 * Unmatched `/auth/*` URLs → auth `not-found`.
 */
export default function AuthUnmatchedCatchAllPage() {
  notFound();
}
