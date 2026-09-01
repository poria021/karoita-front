'use client';

import { notFound, useParams } from 'next/navigation';

import { InternshipEnrollmentModule } from '@/features/karvita/internship-enrollment/components/InternshipEnrollmentModule';
import { parseInternshipEnrollmentLevel } from '@/features/karvita/internship-enrollment/lib/parseInternshipEnrollmentLevel';

/**
 * صفحهٔ کلاینت تا عوض‌کردن سطح کارورزی `await params` سمت سرور نزند.
 * Server Component ناهم‌زمان اینجا سگمنت داشبورد را suspend می‌کند و
 * Next ۱۶ ممکن است به بار کامل سند برگردد (Network tab خالی می‌شود).
 */
export function InternshipEnrollmentLevelClientPage() {
  const params = useParams();
  const raw = typeof params.level === 'string' ? params.level : '';
  const level = parseInternshipEnrollmentLevel(raw);
  if (!level) notFound();

  return <InternshipEnrollmentModule level={level} />;
}
