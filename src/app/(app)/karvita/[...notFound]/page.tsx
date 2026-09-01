import { notFound } from 'next/navigation';

/**
 * URL بی‌تطبیق `/karvita/*` به‌تنهایی به `(app)/not-found.tsx` نمی‌خورد
 * (نکست `app/not-found` ریشه را بیرون شِل سرو می‌کند). این catch-all داخل
 * `(app)/layout` می‌خورد و `notFound()` می‌اندازد تا UI وضعیت inset، Header/Sidebar را نگه دارد.
 */
export default function KarvitaUnmatchedCatchAllPage() {
  notFound();
}
