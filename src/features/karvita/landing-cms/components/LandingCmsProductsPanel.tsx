'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { KvImageDocUploader } from '@/components/shared/fields/KvImageDocUploader';
import { KvTextField } from '@/components/shared/fields/KvTextField';
import { KvTableCell } from '@/components/shared/table/KvTable';
import { useLocalFormDraft } from '@/hooks/useLocalFormDraft';
import type {
  CreateLandingProductInput,
  LandingProduct,
} from '@/types/landing-cms';
import { faIcons } from '@/utils/iconMap';

import {
  getLandingCmsTabConfig,
  LANDING_ICON_MAX_SIZE_MB,
  LANDING_PRODUCT_LOGO_ACCEPT,
  LANDING_PRODUCT_LOGO_INVALID_TYPE,
  LANDING_PRODUCT_LOGO_MAX_SIZE_HELPER,
} from '../constants';
import type { LandingCmsDeleteTarget } from '../hooks/useLandingCmsPage';
import {
  productFormSchema,
  type ProductFormInput,
  type ProductFormValues,
} from '../schemas/landing-cms.schema';
import { LandingCmsEntityTable } from './LandingCmsEntityTable';
import { LandingCmsMediaThumb } from './LandingCmsMediaThumb';

const PRODUCT_COLUMNS = [
  { key: 'logo', label: 'لوگو', align: 'center' as const, className: 'w-20' },
  { key: 'title', label: 'عنوان محصول' },
  { key: 'link', label: 'لینک هدایت' },
] as const;

type LandingCmsProductsPanelProps = {
  items: LandingProduct[];
  isLoading: boolean;
  onCreate: (input: CreateLandingProductInput) => void;
  onRequestDelete: (target: LandingCmsDeleteTarget) => void;
};

export function LandingCmsProductsPanel({
  items,
  isLoading,
  onCreate,
  onRequestDelete,
}: LandingCmsProductsPanelProps) {
  const tabConfig = getLandingCmsTabConfig('products');
  const form = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { title: '', link: '', logoImage: null },
    mode: 'onSubmit',
  });

  // پیش‌نویس محلی فقط برای فیلدهای متنی (فایل لوگو هرگز serialize نمی‌شود).
  const {
    value: productDraft,
    hasDraft: hasProductDraft,
    setValue: setProductDraft,
    clearDraft: clearProductDraft,
  } = useLocalFormDraft<{ title: string; link: string }>({
    key: 'landing-cms-product-form',
    initialValue: { title: '', link: '' },
    debounceMs: 400,
  });

  useEffect(() => {
    if (!hasProductDraft) return;
    form.reset({ title: productDraft.title, link: productDraft.link, logoImage: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // از form.watch عمداً استفاده نمی‌شود (React Compiler این پروژه آن را
  // غیرقابل-memoize می‌داند)؛ به‌جایش داخل onChange خود register مقدار فعلی را می‌خوانیم.
  const syncProductDraftFromForm = useCallback(() => {
    const values = form.getValues();
    setProductDraft({ title: values.title ?? '', link: values.link ?? '' });
  }, [form, setProductDraft]);

  const submit = form.handleSubmit((values) => {
    onCreate({
      title: values.title,
      link: values.link,
      logoImage: values.logoImage,
    });
    form.reset({ title: '', link: '', logoImage: null });
    clearProductDraft();
  });

  return (
    <div className="grid grid-cols-1 gap-kv-section lg:grid-cols-12 lg:items-start">
      <form
        onSubmit={submit}
        noValidate
        className="flex flex-col gap-kv-group rounded-kv-panel border border-kv-border bg-kv-surface p-kv-group lg:col-span-4"
      >
        <div className="flex items-center gap-kv-inline border-b border-kv-border-muted pb-kv-group">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand-soft text-kv-brand">
            <FaIcon icon={faIcons.plus} size="xs" />
          </span>
          <KvTypography variant="subtitle" as="h2">
            افزودن محصول جدید به داک شناور
          </KvTypography>
        </div>

        <Controller
          name="logoImage"
          control={form.control}
          render={({ field, fieldState }) => (
            <KvImageDocUploader
              value={field.value}
              onChange={field.onChange}
              label={false}
              framed={false}
              error={fieldState.error?.message}
              maxSizeMb={LANDING_ICON_MAX_SIZE_MB}
              accept={LANDING_PRODUCT_LOGO_ACCEPT}
              invalidTypeMessage={LANDING_PRODUCT_LOGO_INVALID_TYPE}
              helperText={LANDING_PRODUCT_LOGO_MAX_SIZE_HELPER}
              previewAlt="پیش‌نمایش لوگوی محصول"
              // فشرده‌سازی پیش‌فرض همیشه به WebP تبدیل می‌کند؛ چون اسکیمای این فرم
              // فقط PNG/SVG را قبول می‌کند، فایل معتبر با فشرده‌سازی رد می‌شد.
              compress={false}
            />
          )}
        />

        <KvTextField
          id="landing-product-title"
          label="عنوان محصول"
          required
          placeholder="مثال: پرتال پژوهشگران"
          error={form.formState.errors.title?.message}
          {...form.register('title', { onChange: syncProductDraftFromForm })}
        />

        <KvTextField
          id="landing-product-link"
          label="لینک هدایت هنگام کلیک"
          required
          dir="ltr"
          scriptGuard="none"
          placeholder="مثال: /auth/login یا https://..."
          error={form.formState.errors.link?.message}
          {...form.register('link', { onChange: syncProductDraftFromForm })}
        />

        <KvButton
          type="submit"
          color="cta"
          size="md"
          loading={form.formState.isSubmitting}
          className="self-end"
        >
          افزودن محصول شناور
        </KvButton>
      </form>

      <div className="lg:col-span-8">
        <LandingCmsEntityTable
          resetKey="products"
          columns={PRODUCT_COLUMNS}
          items={items}
          isLoading={isLoading}
          emptyTitle={tabConfig.emptyTitle}
          emptyDescription={tabConfig.emptyDescription}
          deleteAriaLabel={(row) => `حذف محصول ${row.title}`}
          onDelete={(row) =>
            onRequestDelete({
              kind: 'products',
              id: row.id,
              label: row.title,
            })
          }
          renderCells={(row) => (
            <>
              <KvTableCell align="center">
                <LandingCmsMediaThumb
                  imageUrl={row.logoImageUrl || undefined}
                  iconStem={row.icon}
                  alt={row.title}
                />
              </KvTableCell>
              <KvTableCell emphasis>{row.title}</KvTableCell>
              <KvTableCell
                className="max-w-[12rem] truncate font-mono text-xs text-kv-text-muted"
                dir="ltr"
              >
                {row.link}
              </KvTableCell>
            </>
          )}
        />
      </div>
    </div>
  );
}
