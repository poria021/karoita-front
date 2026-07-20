'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvConfirmationDialog } from '@/components/shared/KvConfirmationDialog';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';
import { getPostLoginPath } from '@/services/post-login-path';
import { useUserStore } from '@/store/useUserStore';
import { isSuperAdminRole } from '@/utils/RoleStrategyMap';

import { useOrgStructurePage } from '../hooks/useOrgStructurePage';
import { OrgStructureEntityModal } from './OrgStructureEntityModal';
import { OrgStructurePageSkeleton } from '../skeletons/OrgStructurePageSkeleton';
import { OrgStructureSubTabs } from './OrgStructureSubTabs';
import { OrgStructureTable } from './OrgStructureTable';
import { OrgStructureToolbar } from './OrgStructureToolbar';

export function OrgStructurePage() {
  const router = useRouter();
  const activeUser = useUserStore((state) => state.activeUser);
  const page = useOrgStructurePage();

  useEffect(() => {
    if (!activeUser) return;
    if (!isSuperAdminRole(activeUser.role)) {
      router.replace(getPostLoginPath(activeUser));
    }
  }, [activeUser, router]);

  if (!activeUser || !isSuperAdminRole(activeUser.role)) {
    return (
      <div className="min-h-40 w-full bg-kv-canvas" aria-busy="true" />
    );
  }

  if (page.isCold) {
    return <OrgStructurePageSkeleton />;
  }

  return (
    <>
      <KvWorkspace
        tabs={
          <OrgStructureSubTabs active={page.tab} onChange={page.changeTab} />
        }
        toolbar={
          <OrgStructureToolbar
            tabConfig={page.tabConfig}
            query={page.query}
            onQueryChange={page.setQuery}
            onAdd={page.openCreate}
          />
        }
      >
        {page.error ? (
          <KvAlert
            variant="error"
            title="بارگذاری ساختار سازمانی ناموفق بود"
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
          <OrgStructureTable
            tabConfig={page.tabConfig}
            items={page.items}
            isLoading={page.isLoading}
            isLoadingMore={page.isLoadingMore}
            hasMore={page.hasMore}
            loadMoreError={page.loadMoreError}
            onLoadMore={() => void page.loadMore()}
            onRetryLoadMore={() => {
              page.clearLoadMoreError();
              void page.loadMore();
            }}
            onEdit={page.openEdit}
            onDelete={page.requestDelete}
          />
        )}
      </KvWorkspace>

      <OrgStructureEntityModal
        open={page.editorOpen}
        tab={page.tab}
        entityKind={page.entityKind}
        editId={page.editId}
        onClose={page.closeEditor}
        onSaved={() => void page.reload()}
      />

      <KvConfirmationDialog
        isOpen={Boolean(page.deleteTarget)}
        onClose={page.clearDelete}
        onConfirm={page.confirmDelete}
        title="حذف از ساختار سازمانی"
        description={
          page.deleteTarget
            ? `آیا از حذف کامل «${page.deleteTarget.name}» از ساختار تقسیمات سازمانی سامانه کارویتا اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`
            : ''
        }
        confirmText="حذف"
        cancelText="انصراف"
        confirmVariant="destructive"
      />
    </>
  );
}
