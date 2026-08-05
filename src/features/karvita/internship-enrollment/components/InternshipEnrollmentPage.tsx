'use client';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';

import { useInternshipEnrollmentPage } from '../hooks/useInternshipEnrollmentPage';
import { InternshipEnrollmentGate } from './InternshipEnrollmentGate';
import { InternshipEnrollmentGuard } from './InternshipEnrollmentGuard';

export function InternshipEnrollmentPage() {
  const page = useInternshipEnrollmentPage();

  return (
    <InternshipEnrollmentGuard>
      <KvWorkspace panel={false}>
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
            state={page.state}
            isLoading={page.isLoading}
          />
        )}
      </KvWorkspace>
    </InternshipEnrollmentGuard>
  );
}
