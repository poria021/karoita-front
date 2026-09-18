'use client';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';
import type { InternshipEnrollmentLevel } from '@/types/internship-enrollment';

import { useInternshipEnrollmentPage } from '../hooks/useInternshipEnrollmentPage';
import { InternshipEnrollmentGate } from './InternshipEnrollmentGate';
import { InternshipEnrollmentGuard } from './InternshipEnrollmentGuard';

type InternshipEnrollmentPageProps = {
  level: InternshipEnrollmentLevel;
};

export function InternshipEnrollmentPageClient({
  level,
}: InternshipEnrollmentPageProps) {
  const page = useInternshipEnrollmentPage(level);

  return (
    <InternshipEnrollmentGuard>
      <KvWorkspace
        panel={false}
        className="flex min-h-0 flex-1 flex-col"
      >
        {page.error ? (
          <KvAlert
            variant="error"
            title="بارگذاری انتخاب واحد ناموفق بود"
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
        ) : (
          <InternshipEnrollmentGate
            actor={page.actor}
            state={page.state}
            isLoading={page.isLoading}
            onEnrollmentComplete={page.reload}
            onEnrollmentCancel={page.cancelEnrollment}
            termHistory={page.termHistory}
            selectedTermId={page.selectedTermId}
            onSelectTerm={page.onSelectTerm}
            isViewingHistory={page.isViewingHistory}
            viewedEnrollment={page.viewedEnrollment}
            isLoadingViewedTerm={page.isLoadingViewedTerm}
            viewedTermError={page.viewedTermError}
          />
        )}
      </KvWorkspace>
    </InternshipEnrollmentGuard>
  );
}
