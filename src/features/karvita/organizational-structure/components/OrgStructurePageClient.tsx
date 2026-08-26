'use client';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { SuperAdminModuleGuard } from '@/components/shared/shell/SuperAdminModuleGuard';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';

import { useOrgStructurePage } from '../hooks/useOrgStructurePage';
import { OrgStructureEntityModal } from './OrgStructureEntityModal';
import { OrgStructureSubTabs } from './OrgStructureSubTabs';
import { OrgStructureTable } from './OrgStructureTable';
import { OrgStructureToolbar } from './OrgStructureToolbar';

export function OrgStructurePageClient() {
  const page = useOrgStructurePage();

  return (
    <SuperAdminModuleGuard>
      <KvWorkspace
        panel={false}
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
                onClick={page.reload}
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
            query={page.query}
            onLoadMore={page.loadMore}
            onRetryLoadMore={page.retryLoadMore}
            onClearQuery={() => page.setQuery('')}
            onAdd={page.openCreate}
            onEdit={page.openEdit}
            onDelete={page.requestDelete}
          />
        )}
      </KvWorkspace>

      {page.editorOpen ? (
        <OrgStructureEntityModal
          open={page.editorOpen}
          tab={page.tab}
          entityKind={page.entityKind}
          editId={page.editId}
          editRow={page.editRow}
          onClose={page.closeEditor}
          onSaved={page.invalidateAndReload}
          onCreate={page.scheduleCreate}
        />
      ) : null}
    </SuperAdminModuleGuard>
  );
}
