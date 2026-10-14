'use client';

import dynamic from 'next/dynamic';
import { useState, type FormEvent } from 'react';
import type { Accept } from 'react-dropzone';

import { FaIcon } from '@/components/shared/FaIcon';
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
import { KvTextField } from '@/components/shared/fields/KvTextField';
import { faIcons } from '@/utils/iconMap';

// react-dropzone + فشرده‌ساز فقط وقتی مودال باز است بارگذاری شود.
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

export type LandingCmsEditField<K extends string> = {
  name: K;
  label: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  dir?: 'ltr';
};

export type LandingCmsEditImage = {
  /** تصویر فعلی؛ خالی یعنی آیکون پیش‌فرض. */
  existingUrl: string;
  label: string;
  helperText: string;
  maxSizeMb: number;
  previewAlt: string;
  /**
   * `required`: بدون تصویر ذخیره نمی‌شود (بنر/محصول).
   * `removable`: برداشتن تصویر یعنی بازگشت به آیکون پیش‌فرض (شبکهٔ اجتماعی).
   */
  mode: 'required' | 'removable';
  accept?: Accept;
  invalidTypeMessage?: string;
  compress?: boolean;
  compressMaxWidth?: number;
};

/** فقط چیزهایی که عوض شده‌اند؛ `image: null` یعنی تصویر برداشته شد. */
export type LandingCmsEditChanges<K extends string> = {
  text: Partial<Record<K, string>>;
  image?: File | null;
};

type LandingCmsEditDialogProps<K extends string> = {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  fields: readonly LandingCmsEditField<K>[];
  initial: Record<K, string>;
  image: LandingCmsEditImage;
  onSave: (changes: LandingCmsEditChanges<K>) => void;
};

/**
 * مودال ویرایش مشترک بنر / محصول / شبکهٔ اجتماعی.
 * فرم افزودن کنار جدول دست نمی‌خورد (پیش‌نویسش هم حفظ می‌شود)؛ این مودال
 * با مقادیر فعلی پر می‌شود، «ذخیره» تا وقتی چیزی عوض نشده غیرفعال است و
 * فقط فیلدهای تغییرکرده به PATCH می‌روند.
 */
export function LandingCmsEditDialog<K extends string>(
  props: LandingCmsEditDialogProps<K>
) {
  return (
    <KvDialog
      open={props.open}
      onOpenChange={(next) => {
        if (!next) props.onClose();
      }}
    >
      {/* محتوا فقط هنگام باز بودن mount می‌شود تا هر بار با مقدار تازهٔ ردیف پر شود. */}
      {props.open ? <EditForm {...props} /> : null}
    </KvDialog>
  );
}

function EditForm<K extends string>({
  onClose,
  title,
  description,
  fields,
  initial,
  image,
  onSave,
}: LandingCmsEditDialogProps<K>) {
  const [values, setValues] = useState<Record<K, string>>(initial);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imageCleared, setImageCleared] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<K | 'image', string>>>({});

  const changedText = Object.fromEntries(
    fields
      .filter((field) => values[field.name].trim() !== initial[field.name].trim())
      .map((field) => [field.name, values[field.name]])
  ) as Partial<Record<K, string>>;
  const imageRemoved =
    image.mode === 'removable' && imageCleared && !newImage && Boolean(image.existingUrl);
  const isDirty =
    Object.keys(changedText).length > 0 || Boolean(newImage) || imageRemoved;

  function validate(): boolean {
    const next: Partial<Record<K | 'image', string>> = {};
    for (const field of fields) {
      const value = values[field.name].trim();
      if (field.required && !value) {
        next[field.name] = `وارد کردن ${field.label} الزامی است.`;
      } else if (field.minLength && value && value.length < field.minLength) {
        next[field.name] = `${field.label} باید حداقل ${field.minLength.toLocaleString('fa-IR')} کاراکتر باشد.`;
      }
    }
    if (image.mode === 'required' && imageCleared && !newImage) {
      next.image = 'تصویر را برداشته‌اید؛ یک تصویر جدید انتخاب کنید یا انصراف دهید.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!isDirty || !validate()) return;
    onSave({
      text: changedText,
      ...(newImage ? { image: newImage } : imageRemoved ? { image: null } : {}),
    });
    onClose();
  }

  return (
    <KvDialogContent size="lg" className="max-h-[90dvh] overflow-y-auto">
      <KvDialogHeader>
        <div className="flex items-center gap-kv-inline">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand-soft text-kv-brand">
            <FaIcon icon={faIcons.penToSquare} size="sm" />
          </span>
          <div className="min-w-0">
            <KvDialogTitle>{title}</KvDialogTitle>
            <KvDialogDescription>{description}</KvDialogDescription>
          </div>
        </div>
      </KvDialogHeader>

      <form className="flex flex-col gap-kv-group" noValidate onSubmit={submit}>
        <div className="space-y-kv-pair">
          <KvTypography variant="label" as="p">
            {image.label}
          </KvTypography>
          <KvImageDocUploader
            value={newImage}
            existingUrl={image.existingUrl || null}
            onChange={(file) => {
              setNewImage(file);
              if (!file) setImageCleared(true);
              setErrors((prev) => ({ ...prev, image: undefined }));
            }}
            label={false}
            framed={false}
            error={errors.image}
            maxSizeMb={image.maxSizeMb}
            helperText={image.helperText}
            previewAlt={image.previewAlt}
            accept={image.accept}
            invalidTypeMessage={image.invalidTypeMessage}
            compress={image.compress}
            compressMaxWidth={image.compressMaxWidth}
          />
          {imageRemoved ? (
            <KvTypography variant="caption" tone="muted" as="p">
              آیکون برداشته می‌شود و آیکون پیش‌فرض نمایش داده خواهد شد.
            </KvTypography>
          ) : newImage ? (
            <KvTypography variant="caption" tone="muted" as="p">
              تصویر جدید جایگزین تصویر فعلی می‌شود.
            </KvTypography>
          ) : null}
        </div>

        {fields.map((field) => (
          <KvTextField
            key={field.name}
            id={`landing-edit-${field.name}`}
            label={field.label}
            required={field.required}
            optionalHint={!field.required}
            placeholder={field.placeholder}
            dir={field.dir}
            scriptGuard={field.dir === 'ltr' ? 'none' : undefined}
            value={values[field.name]}
            error={errors[field.name]}
            onChange={(event) => {
              const nextValue = event.target.value;
              setValues((prev) => ({ ...prev, [field.name]: nextValue }));
              setErrors((prev) => ({ ...prev, [field.name]: undefined }));
            }}
          />
        ))}

        <KvDialogFooter>
          <KvButton
            type="button"
            color="neutral"
            appearance="secondary"
            size="md"
            onClick={onClose}
          >
            انصراف
          </KvButton>
          <KvButton
            type="submit"
            color="cta"
            size="md"
            disabled={!isDirty}
            title={isDirty ? undefined : 'هنوز تغییری ایجاد نکرده‌اید'}
          >
            ذخیرهٔ تغییرات
          </KvButton>
        </KvDialogFooter>
      </form>
    </KvDialogContent>
  );
}
