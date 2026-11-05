'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvConfirmationDialog } from '@/components/shared/KvConfirmationDialog';
import { KvFeatureIntro } from '@/components/shared/shell/KvFeatureIntro';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';
import type { BulletinKind } from '@/types/bulletins';
import { faIcons } from '@/utils/iconMap';

import { useBulletinsManagePage } from '../hooks/useBulletinsManagePage';
import { BulletinFormModal } from './BulletinFormModal';
import { BulletinsTable } from './BulletinsTable';

const TAB_COPY: Record<
  BulletinKind,
  { title: string; description: string; noun: string }
> = {
  announcement: {
    title: 'اطلاعیه‌های منتشرشده',
    description:
      'اطلاعیه‌ها در باکس میز کار نقش‌های مخاطب با نام پنل شما نمایش داده می‌شوند.',
    noun: 'اطلاعیه',
  },
  advertisement: {
    title: 'تبلیغات',
    description: 'تبلیغات در میز کار همهٔ پنل‌های انتخاب‌شده نمایش داده می‌شود.',
    noun: 'تبلیغ',
  },
};

type BulletinsComposePanelProps = {
  kind: BulletinKind;
};

/** پنل انتشار — جدول + فرم مودال برای تب announcement / advertisement. */
export function BulletinsComposePanel({ kind }: BulletinsComposePanelProps) {
  const page = useBulletinsManagePage(kind);
  const copy = TAB_COPY[page.activeTab];

  return (
    <>
      <KvWorkspace
        panel={false}
        toolbar={
          <div className="border-b border-kv-border-muted pb-kv-group">
            <KvFeatureIntro
              title={copy.title}
              description={copy.description}
              className="gap-kv-inline lg:items-center"
              actions={
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
                  {`انتشار ${copy.noun}`}
                </KvButton>
              }
            />
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
            emptyTitle={`هنوز ${copy.noun}ی منتشر نکرده‌اید`}
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
        title={`حذف ${copy.noun}`}
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
