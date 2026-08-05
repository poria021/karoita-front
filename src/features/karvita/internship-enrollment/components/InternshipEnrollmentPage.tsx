'use client';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';

import { buildLevelTabs } from '../constants';
import { useInternshipEnrollmentPage } from '../hooks/useInternshipEnrollmentPage';
import { InternshipEnrollmentGate } from './InternshipEnrollmentGate';
import { InternshipEnrollmentGuard } from './InternshipEnrollmentGuard';
import { InternshipLevelTabs } from './InternshipLevelTabs';

export function InternshipEnrollmentPage() {
  const page = useInternshipEnrollmentPage();
  const tabs = page.role ? buildLevelTabs(page.role) : [];

  return (
    <InternshipEnrollmentGuard>
      <KvWorkspace
        panel={false}
        tabs={
          tabs.length > 0 ? (
            <InternshipLevelTabs
              tabs={tabs}
              active={page.level}
              onChange={page.changeLevel}
            />
          ) : null
        }
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
            state={page.state}
            isLoading={page.isLoading}
          />
        )}
      </KvWorkspace>
    </InternshipEnrollmentGuard>
  );
}
