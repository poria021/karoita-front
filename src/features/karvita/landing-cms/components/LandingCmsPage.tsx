'use client';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvConfirmationDialog } from '@/components/shared/KvConfirmationDialog';
import { SuperAdminModuleGuard } from '@/components/shared/shell/SuperAdminModuleGuard';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';

import { useLandingCmsPage } from '../hooks/useLandingCmsPage';
import { LandingCmsBannersPanel } from './LandingCmsBannersPanel';
import { LandingCmsProductsPanel } from './LandingCmsProductsPanel';
import { LandingCmsSocialsPanel } from './LandingCmsSocialsPanel';
import { LandingCmsSubTabs } from './LandingCmsSubTabs';

export function LandingCmsPage() {
  const page = useLandingCmsPage();

  return (
    <SuperAdminModuleGuard>
      <KvWorkspace
        panel={false}
        tabs={
          <LandingCmsSubTabs active={page.tab} onChange={page.changeTab} />
        }
      >
        {page.error ? (
          <KvAlert
            variant="error"
            title="بارگذاری محتوای لندینگ ناموفق بود"
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
        ) : null}

        {!page.error && page.tab === 'banners' ? (
          <LandingCmsBannersPanel
            items={page.banners}
            isLoading={page.isLoading}
            onSoftReload={page.softReload}
            onRequestDelete={page.requestDelete}
          />
        ) : null}

        {!page.error && page.tab === 'socials' ? (
          <LandingCmsSocialsPanel
            items={page.socials}
            isLoading={page.isLoading}
            onSoftReload={page.softReload}
            onRequestDelete={page.requestDelete}
          />
        ) : null}

        {!page.error && page.tab === 'products' ? (
          <LandingCmsProductsPanel
            items={page.products}
            isLoading={page.isLoading}
            onSoftReload={page.softReload}
            onRequestDelete={page.requestDelete}
          />
        ) : null}
      </KvWorkspace>

      <KvConfirmationDialog
        isOpen={Boolean(page.deleteTarget)}
        onClose={page.clearDelete}
        onConfirm={page.confirmDelete}
        title="حذف از محتوای لندینگ"
        description={
          page.deleteTarget
            ? `آیا از حذف «${page.deleteTarget.label}» اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`
            : ''
        }
        confirmText="حذف"
        cancelText="انصراف"
        confirmVariant="destructive"
      />
    </SuperAdminModuleGuard>
  );
}
