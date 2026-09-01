import { notFound } from 'next/navigation';

/** URL بی‌تطبیق `/auth/*` → `not-found` احراز هویت. */
export default function AuthUnmatchedCatchAllPage() {
  notFound();
}
