'use client';

import { notFound, useParams } from 'next/navigation';

import { InternshipEnrollmentModule } from '@/features/karvita/internship-enrollment/components/InternshipEnrollmentModule';
import { parseInternshipEnrollmentLevel } from '@/features/karvita/internship-enrollment/lib/parseInternshipEnrollmentLevel';

/**
 * Client page so switching internship levels does not `await params` on the
 * server. An async Server Component here suspends the dashboard segment and
 * Next.js 16 may fall back to a full document load (Network tab clears).
 */
export function InternshipEnrollmentLevelClientPage() {
  const params = useParams();
  const raw = typeof params.level === 'string' ? params.level : '';
  const level = parseInternshipEnrollmentLevel(raw);
  if (!level) notFound();

  return <InternshipEnrollmentModule level={level} />;
}
