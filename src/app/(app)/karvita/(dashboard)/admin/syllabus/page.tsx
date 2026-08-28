'use client';

import { useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';

import { SyllabusModule } from '@/features/karvita/syllabus-config/components/SyllabusModule';
import { RouteService } from '@/services/route.service';

/** Index bounce — paint course-offerings immediately, then canonicalize the URL. */
export default function SyllabusConfigIndexPage() {
  const router = useRouter();

  useLayoutEffect(() => {
    router.replace(RouteService.karvita.syllabusCourseOfferings());
  }, [router]);

  return <SyllabusModule section="course_offerings" />;
}
