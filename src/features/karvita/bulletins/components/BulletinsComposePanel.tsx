'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvConfirmationDialog } from '@/components/shared/KvConfirmationDialog';
import { KvTypography } from '@/components/shared/KvTypography';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';
import type { BulletinKind } from '@/types/bulletins';
import { faIcons } from '@/utils/iconMap';

import { useBulletinsManagePage } from '../hooks/useBulletinsManagePage';
import { BulletinFormModal } from './BulletinFormModal';
import { BulletinsTable } from './BulletinsTable';

const TAB_LABEL: Record<BulletinKind, string> = {
  announcement: 'اطلاعیه‌های منتشرشده',
  advertisement: 'تبلیغات',
};

type BulletinsComposePanelProps = {
  kind: BulletinKind;
};

/** پنل انتشار — جدول + فرم مودال برای تب announcement / advertisement. */
export function BulletinsComposePanel({ kind }: BulletinsComposePanelProps) {
  const page = useBulletinsManagePage(kind);
  const noun = page.activeTab === 'advertisement' ? 'تبلیغ' : 'اطلاعیه';

  return (
    <>
      <KvWorkspace
        panel={false}
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
        ) : (
          <BulletinsTable
            rows={page.listRows}
            kind={page.activeTab}
            isLoading={page.isLoading}
            emptyTitle={`هنوز ${noun}ی منتشر نکرده‌اید`}
            showProvinces={page.canTargetProvinces}
            onEdit={page.startEdit}
            onToggleActive={page.toggleActive}
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
        audienceValues={page.audienceValues}
        canTargetProvinces={page.canTargetProvinces}
        provinceOptions={page.provinceOptions}
        provinceValues={page.provinceValues}
        isProvincesLoading={page.isProvincesLoading}
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
