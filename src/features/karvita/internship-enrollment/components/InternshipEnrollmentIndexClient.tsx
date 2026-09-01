'use client';

import { useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';

import { InternshipEnrollmentModule } from '@/features/karvita/internship-enrollment/components/InternshipEnrollmentModule';
import { RouteService } from '@/services/route.service';

/** پرش ایندکس — فوراً L1 را رنگ کن، بعد URL را canonicalize کن. */
export function InternshipEnrollmentIndexClient() {
  const router = useRouter();

  useLayoutEffect(() => {
    router.replace(RouteService.karvita.internshipSelection(1));
  }, [router]);

  return <InternshipEnrollmentModule level={1} />;
}
