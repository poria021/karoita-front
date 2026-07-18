'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { KvConfirmationDialog } from '@/components/shared/KvConfirmationDialog';
import { getPostLoginPath } from '@/services/post-login-path';
import { useUserStore } from '@/store/useUserStore';
import { isSuperAdminRole } from '@/utils/RoleStrategyMap';

import { useOrgStructurePage } from '../hooks/useOrgStructurePage';
import { OrgStructureEntityModal } from './OrgStructureEntityModal';
import { OrgStructureMobileList } from './OrgStructureMobileList';
import { OrgStructureSubTabs } from './OrgStructureSubTabs';
import { OrgStructureTable } from './OrgStructureTable';
import { OrgStructureToolbar } from './OrgStructureToolbar';

/**
 * Super-admin organizational structure workspace.
 * UX gate only — Nest must enforce authorization later (rule 45).
 */
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

  return (
    <div className="space-y-kv-section" dir="rtl">
      <OrgStructureSubTabs active={page.tab} onChange={page.changeTab} />

      <div className="space-y-5 rounded-kv-panel border border-kv-border bg-kv-surface p-4 sm:p-6">
        <OrgStructureToolbar
          tabConfig={page.tabConfig}
          query={page.query}
          onQueryChange={page.setQuery}
          onAdd={page.openCreate}
        />

        {page.error ? (
          <p role="alert" className="text-xs font-bold text-kv-danger">
            {page.error}
          </p>
        ) : null}

        <div className="overflow-hidden rounded-kv-panel border border-kv-border bg-kv-surface shadow-kv-raised">
          <OrgStructureTable
            tabConfig={page.tabConfig}
            items={page.items}
            isLoading={page.isLoading}
            onEdit={page.openEdit}
            onDelete={page.requestDelete}
          />
          <OrgStructureMobileList
            tabConfig={page.tabConfig}
            items={page.mobileItems}
            isLoading={page.isLoading}
            canLoadMore={page.canLoadMore}
            onLoadMore={page.loadMore}
            onEdit={page.openEdit}
            onDelete={page.requestDelete}
          />
        </div>
      </div>

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
    </div>
  );
}
