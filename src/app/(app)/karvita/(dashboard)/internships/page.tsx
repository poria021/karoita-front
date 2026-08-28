'use client';

import { useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';

import { InternshipEnrollmentModule } from '@/features/karvita/internship-enrollment/components/InternshipEnrollmentModule';
import { RouteService } from '@/services/route.service';

/** Index bounce — paint L1 immediately, then canonicalize the URL. */
export default function InternshipEnrollmentIndexPage() {
  const router = useRouter();

  useLayoutEffect(() => {
    router.replace(RouteService.karvita.internshipSelection(1));
  }, [router]);

  return <InternshipEnrollmentModule level={1} />;
}
