'use client';

import { useLayoutEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvConfirmationDialog } from '@/components/shared/KvConfirmationDialog';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvTypography } from '@/components/shared/KvTypography';
import { DashboardAccessPlaceholder } from '@/components/shared/shell/DashboardAccessPlaceholder';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';
import { canPublishAnnouncements } from '@/services/bulletins/bulletin-rules';
import { getPostLoginPath } from '@/services/post-login-path';
import { useUserStore } from '@/store/useUserStore';
import type { BulletinKind } from '@/types/bulletins';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { useBulletinsManagePage } from '../hooks/useBulletinsManagePage';
import { BulletinFormModal } from './BulletinFormModal';
import { BulletinsTable } from './BulletinsTable';

/** فقط نقش‌هایی که زیرمجموعه دارند؛ بقیه به میز کار خودشان برمی‌گردند. */
function BulletinsPublisherGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const activeUser = useUserStore((state) => state.activeUser);
  const shouldRedirect = Boolean(
    activeUser && !canPublishAnnouncements(activeUser.role)
  );

  useLayoutEffect(() => {
    if (!shouldRedirect || !activeUser) return;
    router.replace(getPostLoginPath(activeUser));
  }, [activeUser, router, shouldRedirect]);

  if (!activeUser || shouldRedirect) return <DashboardAccessPlaceholder />;
  return <>{children}</>;
}

const TAB_LABEL: Record<BulletinKind, string> = {
  announcement: 'اطلاعیه‌ها',
  advertisement: 'تبلیغات',
};

function BulletinsManageContent() {
  const page = useBulletinsManagePage();
  const noun = page.activeTab === 'advertisement' ? 'تبلیغ' : 'اطلاعیه';
  const tabs: BulletinKind[] = page.canAds
    ? ['announcement', 'advertisement']
    : ['announcement'];

  return (
    <>
      <KvWorkspace
        panel={false}
        tabs={
          page.canAds ? (
            <div className="mb-kv-pair">
              <AppTabs
                value={page.activeTab}
                onValueChange={(value) => page.setTab(value as BulletinKind)}
                gridCols={2}
              >
                <AppTabsList aria-label="نوع انتشار">
                  {tabs.map((kind) => (
                    <AppTabsTrigger key={kind} value={kind}>
                      {TAB_LABEL[kind]} (
                      {toPersianDigits(String(page.counts[kind]))})
                    </AppTabsTrigger>
                  ))}
                </AppTabsList>
              </AppTabs>
            </div>
          ) : undefined
        }
        toolbar={
          <div className="flex flex-col justify-start gap-kv-group pt-kv-pair lg:flex-row lg:items-center lg:justify-between lg:ps-kv-group">
            <div className="flex min-w-0 flex-col items-start gap-kv-field text-start">
              <KvTypography variant="subtitle" weight="bold" as="h3">
                {TAB_LABEL[page.activeTab]}
              </KvTypography>
              <KvTypography variant="caption" tone="muted">
                {page.activeTab === 'advertisement'
                  ? 'تبلیغات در میز کار همهٔ پنل‌های انتخاب‌شده نمایش داده می‌شود.'
                  : 'اطلاعیه‌های شما در باکس «اطلاعیه‌ها»ی میز کار نقش‌های زیرمجموعه با بج نام پنل‌تان نمایش داده می‌شود.'}
              </KvTypography>
            </div>
            <KvButton
              type="button"
              color="cta"
              appearance="solid"
              className="w-full shrink-0 lg:w-auto"
              disabled={page.isLoading || Boolean(page.error)}
              onClick={page.openCreate}
              icon={<FaIcon icon={faIcons.plus} size="xs" />}
              iconPosition="start"
            >
              {`انتشار ${noun}`}
            </KvButton>
          </div>
        }
      >
        {page.error ? (
          <KvAlert
            variant="error"
            title="بارگذاری ناموفق بود"
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
        ) : page.isLoading ? (
          <KvTypography variant="caption" tone="muted" as="p">
            در حال بارگذاری…
          </KvTypography>
        ) : page.listRows.length === 0 ? (
          <KvEmptyState
            title={`هنوز ${noun}ی منتشر نکرده‌اید`}
            actions={
              <KvButton
                type="button"
                appearance="secondary"
                size="sm"
                onClick={page.openCreate}
              >
                {`انتشار ${noun}`}
              </KvButton>
            }
          />
        ) : (
          <BulletinsTable
            rows={page.listRows}
            onEdit={page.startEdit}
            onDelete={page.requestDelete}
          />
        )}
      </KvWorkspace>

      <BulletinFormModal
        modalOpen={page.modalOpen}
        closeModal={page.closeModal}
        form={page.form}
        isEditing={page.isEditing}
        isDirty={page.isDirty}
        formError={page.formError}
        isSaving={page.isSaving}
        audienceOptions={page.audienceOptions}
        patchForm={page.patchForm}
        setImageFile={page.setImageFile}
        saveBulletin={page.saveBulletin}
      />

      <KvConfirmationDialog
        isOpen={Boolean(page.deleteTarget)}
        onClose={page.clearDelete}
        onConfirm={page.confirmDelete}
        title={`حذف ${noun}`}
        description={
          page.deleteTarget
            ? `«${page.deleteTarget.title}» از میز کار همهٔ مخاطبان حذف می‌شود. آیا ادامه می‌دهید؟`
            : ''
        }
        confirmText="حذف"
        cancelText="انصراف"
        confirmVariant="destructive"
      />
    </>
  );
}

/** صفحهٔ انتشار اطلاعیه (همهٔ پنل‌های بالادست) و تبلیغ (فقط ستاد مدیر ارشد). */
export function BulletinsManageModule() {
  return (
    <BulletinsPublisherGuard>
      <BulletinsManageContent />
    </BulletinsPublisherGuard>
  );
}
