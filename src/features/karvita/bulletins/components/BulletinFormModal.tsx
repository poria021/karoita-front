'use client';

import dynamic from 'next/dynamic';

import { KvButton } from '@/components/shared/KvButton';
import {
  KvDialog,
  KvDialogContent,
  KvDialogDescription,
  KvDialogFooter,
  KvDialogHeader,
  KvDialogTitle,
} from '@/components/shared/KvDialog';
import { KvTypography } from '@/components/shared/KvTypography';
import { KvCheckboxMultiSelect } from '@/components/shared/fields/KvCheckboxMultiSelect';
import { KvTextArea } from '@/components/shared/fields/KvTextArea';
import { KvTextField } from '@/components/shared/fields/KvTextField';
import {
  BULLETIN_BODY_MAX,
  BULLETIN_TITLE_MAX,
} from '@/services/bulletins/bulletin-rules';
import type { UserRole } from '@/types/auth';

import type { UseBulletinsManagePageReturn } from '../hooks/useBulletinsManagePage';

// react-dropzone + browser-image-compression فقط وقتی فرم تبلیغ باز است بارگذاری شود.
const KvImageDocUploader = dynamic(
  () =>
    import('@/components/shared/fields/KvImageDocUploader').then(
      (m) => m.KvImageDocUploader
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 animate-pulse rounded-kv-panel border-2 border-dashed border-kv-border bg-kv-surface-muted" />
    ),
  }
);

const AD_IMAGE_MAX_SIZE_MB = 5;
const AD_IMAGE_COMPRESS_MAX_WIDTH = 1280;

type BulletinFormModalProps = Pick<
  UseBulletinsManagePageReturn,
  | 'modalOpen'
  | 'closeModal'
  | 'form'
  | 'isEditing'
  | 'isDirty'
  | 'formError'
  | 'isSaving'
  | 'audienceOptions'
  | 'patchForm'
  | 'setImageFile'
  | 'saveBulletin'
>;

/** فرم انتشار/ویرایش اطلاعیه یا تبلیغ. */
export function BulletinFormModal(props: BulletinFormModalProps) {
  const { form, isSaving } = props;
  const isAd = form.kind === 'advertisement';
  const noun = isAd ? 'تبلیغ' : 'اطلاعیه';

  return (
    <KvDialog
      open={props.modalOpen}
      onOpenChange={(next) => {
        if (!next) props.closeModal();
      }}
    >
      <KvDialogContent
        size="lg"
        className="max-h-[90dvh] overflow-y-auto"
        onPointerDownOutside={(event) => {
          if (isSaving) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (isSaving) event.preventDefault();
        }}
      >
        <KvDialogHeader>
          <KvDialogTitle>
            {props.isEditing ? `ویرایش ${noun}` : `انتشار ${noun} جدید`}
          </KvDialogTitle>
          <KvDialogDescription className="sr-only">
            فرم {noun}: عنوان، متن و مخاطبان
          </KvDialogDescription>
        </KvDialogHeader>

        <form
          className="flex flex-col gap-kv-group"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void props.saveBulletin();
          }}
        >
          <KvTextField
            id="bulletin-title"
            label="عنوان"
            required
            size="md"
            scriptGuard="none"
            disabled={isSaving}
            value={form.title}
            maxLength={BULLETIN_TITLE_MAX}
            onChange={(event) => props.patchForm({ title: event.target.value })}
          />

          {isAd ? (
            <KvImageDocUploader
              id="bulletin-image"
              label="تصویر تبلیغ"
              disabled={isSaving}
              value={form.imageFile}
              existingUrl={form.imageUrl || null}
              onChange={(file) => props.setImageFile(file)}
              maxSizeMb={AD_IMAGE_MAX_SIZE_MB}
              compressMaxWidth={AD_IMAGE_COMPRESS_MAX_WIDTH}
              helperText={`JPG، PNG یا WebP — حداکثر ${AD_IMAGE_MAX_SIZE_MB} مگابایت`}
              previewAlt="پیش‌نمایش تصویر تبلیغ"
            />
          ) : null}

          {!isAd ? (
          <KvTextArea
            id="bulletin-body"
            label="متن"
            required
            rows={5}
            scriptGuard="none"
            locked={isSaving}
            value={form.body}
            maxLength={BULLETIN_BODY_MAX}
            onChange={(event) => props.patchForm({ body: event.target.value })}
          />
          ) : null}

          {isAd ? (
            <KvTextField
              id="bulletin-link"
              label="لینک اطلاعات بیشتر"
              size="md"
              scriptGuard="none"
              dir="ltr"
              disabled={isSaving}
              value={form.linkUrl}
              placeholder="https://"
              maxLength={300}
              onChange={(event) =>
                props.patchForm({ linkUrl: event.target.value })
              }
            />
          ) : null}

          <div className="flex flex-col gap-kv-field">
            <KvCheckboxMultiSelect
              id="bulletin-audience"
              label="مخاطبان"
              required
              disabled={isSaving}
              options={props.audienceOptions}
              values={form.audienceRoles}
              placeholder="نقش‌های مخاطب را انتخاب کنید"
              selectAllLabel="همه"
              onValuesChange={(next) =>
                props.patchForm({ audienceRoles: next as UserRole[] })
              }
            />
            <KvTypography variant="caption" tone="muted" as="p">
              {isAd
                ? 'تبلیغ در میز کار نقش‌های انتخاب‌شده نمایش داده می‌شود.'
                : 'اطلاعیه در باکس «اطلاعیه‌ها»ی میز کار نقش‌های زیرمجموعهٔ انتخاب‌شده، با بج نام پنل شما نمایش داده می‌شود.'}
            </KvTypography>
          </div>

          {props.formError ? (
            <div role="alert">
              <KvTypography variant="error">{props.formError}</KvTypography>
            </div>
          ) : null}

          <KvDialogFooter>
            <KvButton
              type="button"
              appearance="secondary"
              size="md"
              disabled={isSaving}
              onClick={props.closeModal}
            >
              انصراف
            </KvButton>
            <KvButton
              type="submit"
              color="cta"
              appearance="solid"
              size="md"
              loading={isSaving}
              disabled={isSaving || !props.isDirty}
            >
              {props.isEditing ? 'ذخیره تغییرات' : 'انتشار'}
            </KvButton>
          </KvDialogFooter>
        </form>
      </KvDialogContent>
    </KvDialog>
  );
}
