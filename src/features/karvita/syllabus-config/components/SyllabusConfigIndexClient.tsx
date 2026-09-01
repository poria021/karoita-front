'use client';

import { useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';

import { SyllabusModule } from '@/features/karvita/syllabus-config/components/SyllabusModule';
import { RouteService } from '@/services/route.service';

/** پرش ایندکس — فوراً ارائه‌های درس را رنگ کن، بعد URL را canonicalize کن. */
export function SyllabusConfigIndexClient() {
  const router = useRouter();

  useLayoutEffect(() => {
    router.replace(RouteService.karvita.syllabusCourseOfferings());
  }, [router]);

  return <SyllabusModule section="course_offerings" />;
}
