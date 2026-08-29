'use client';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import {
  KvCard,
  KvCardContent,
} from '@/components/shared/KvCard';
import { KvCardTitleIcon } from '@/components/shared/KvCardTitleIcon';
import { SuperAdminModuleGuard } from '@/components/shared/shell/SuperAdminModuleGuard';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';
import { KvTypography } from '@/components/shared/KvTypography';
import { faIcons } from '@/utils/iconMap';

import { useAdminUserCreationForm } from '../hooks/useAdminUserCreationForm';
import { useStaffAdminsList } from '../hooks/useStaffAdminsList';
import { AdminUserCreationForm } from './AdminUserCreationForm';
import { StaffAdminsDetailCard } from './StaffAdminsDetailCard';
import { StaffAdminsTable } from './StaffAdminsTable';

export function AdminUserCreationPageClient() {
  const staff = useStaffAdminsList();
  const page = useAdminUserCreationForm({
    onStaffAdminCreated: () => {
      void staff.reload();
    },
  });

  return (
    <SuperAdminModuleGuard>
      <KvWorkspace panel={false}>
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-kv-section">
          <AdminUserCreationForm page={page} />

          <KvCard className="gap-0 border-kv-border py-0 shadow-kv-raised">
            <KvCardContent className="space-y-kv-group p-kv-inset sm:p-kv-block">
              <div className="flex items-center gap-kv-pair border-b border-kv-border pb-kv-inline">
                <KvCardTitleIcon icon={faIcons.userShield} />
                <div className="min-w-0">
                  <KvTypography variant="subtitle" as="h4">
                    حساب‌های ستادی
                  </KvTypography>
                  <KvTypography variant="caption" tone="muted">
                    مدیران کل و دستیاران — برای جزئیات روی ردیف بزنید
                  </KvTypography>
                </div>
              </div>

              {staff.error ? (
                <KvAlert
                  variant="error"
                  title="بارگذاری فهرست ادمین‌ها ناموفق بود"
                  description={staff.error}
                  actions={
                    <KvButton
                      type="button"
                      appearance="secondary"
                      size="sm"
                      onClick={() => {
                        void staff.reload();
                      }}
                    >
                      تلاش مجدد
                    </KvButton>
                  }
                />
              ) : (
                <StaffAdminsTable
                  items={staff.items}
                  selectedId={staff.selectedId}
                  isLoading={staff.isLoading}
                  isLoadingMore={staff.isLoadingMore}
                  hasMore={staff.hasMore}
                  loadMoreError={staff.loadMoreError}
                  onLoadMore={() => {
                    void staff.loadMore();
                  }}
                  onRetryLoadMore={() => {
                    staff.clearLoadMoreError();
                    void staff.loadMore();
                  }}
                  onSelect={staff.select}
                />
              )}
            </KvCardContent>
          </KvCard>

          <StaffAdminsDetailCard
            admin={staff.detail}
            isLoading={staff.detailLoading}
            errorMessage={staff.detailError}
            saving={staff.saving}
            saveError={staff.saveError}
            onSave={staff.save}
          />
        </div>
      </KvWorkspace>
    </SuperAdminModuleGuard>
  );
}
