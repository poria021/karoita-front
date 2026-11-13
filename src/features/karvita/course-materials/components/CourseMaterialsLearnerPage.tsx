'use client';

import { notFound, useParams } from 'next/navigation';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard } from '@/components/shared/KvCard';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';
import { KvBusySurface } from '@/components/shared/table/KvBusySurface';
import { InternshipEnrollmentGuard } from '@/features/karvita/internship-enrollment/components/InternshipEnrollmentGuard';
import { useInternshipEnrollmentPage } from '@/features/karvita/internship-enrollment/hooks/useInternshipEnrollmentPage';
import { parseInternshipEnrollmentLevel } from '@/features/karvita/internship-enrollment/lib/parseInternshipEnrollmentLevel';
import { RouteService } from '@/services/route.service';
import { evaluationCourseFilterId } from '@/services/syllabus-config/course-catalog';
import { catalogIdForKind } from '@/services/syllabus-config/syllabus-mappers';
import type { InternshipEnrollmentLevel } from '@/types/internship-enrollment';

import { CourseMaterialsLearnerPanel } from './CourseMaterialsLearnerPanel';

function CourseMaterialsLearnerBody({
  level,
}: {
  level: InternshipEnrollmentLevel;
}) {
  const page = useInternshipEnrollmentPage(level);
  const backHref = RouteService.karvita.internshipSelection(level);

  if (page.error) {
    return (
      <KvAlert
        variant="error"
        title="بارگذاری جزوات درس ناموفق بود"
        description={page.error}
        actions={
          <KvButton
            type="button"
            appearance="secondary"
            size="sm"
            onClick={() => void page.reload()}
          >
            تلاش مجدد
          </KvButton>
        }
      />
    );
  }

  if (page.isLoading || !page.state) {
    return (
      <KvCard padding="md" className="flex min-h-0 flex-1 flex-col">
        <KvBusySurface className="flex-1" />
      </KvCard>
    );
  }

  const courseKey = evaluationCourseFilterId(
    page.state.lessonId ?? catalogIdForKind(page.state.kind, page.state.level)
  );

  return (
    <CourseMaterialsLearnerPanel
      kind={page.state.kind}
      courseKey={courseKey}
      backHref={backHref}
    />
  );
}

/** صفحهٔ جزوات یک درس — URL جدا از گزارش‌نویسی همان سطح. */
export function CourseMaterialsLearnerPage() {
  const params = useParams();
  const raw = typeof params.level === 'string' ? params.level : '';
  const level = parseInternshipEnrollmentLevel(raw);
  if (!level) notFound();

  return (
    <InternshipEnrollmentGuard>
      <KvWorkspace panel={false} className="flex min-h-0 flex-1 flex-col">
        <CourseMaterialsLearnerBody level={level} />
      </KvWorkspace>
    </InternshipEnrollmentGuard>
  );
}
