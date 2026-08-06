'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { KvImageDocUploader } from '@/components/shared/fields/KvImageDocUploader';
import { KvTextField } from '@/components/shared/fields/KvTextField';
import { KvTableCell } from '@/components/shared/table/KvTable';
import type {
  CreateLandingProductInput,
  LandingProduct,
} from '@/types/landing-cms';
import { faIcons } from '@/utils/iconMap';

import { getLandingCmsTabConfig } from '../constants';
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

  const submit = form.handleSubmit((values) => {
    onCreate({
      title: values.title,
      link: values.link,
      logoImage: values.logoImage,
    });
    form.reset({ title: '', link: '', logoImage: null });
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
              helperText="PNG، JPG تا ۱۰ مگابایت"
              previewAlt="پیش‌نمایش لوگوی محصول"
            />
          )}
        />

        <KvTextField
          id="landing-product-title"
          label="عنوان محصول"
          required
          placeholder="مثال: پرتال پژوهشگران"
          error={form.formState.errors.title?.message}
          {...form.register('title')}
        />

        <KvTextField
          id="landing-product-link"
          label="لینک هدایت هنگام کلیک"
          required
          dir="ltr"
          placeholder="مثال: /auth/login یا https://..."
          error={form.formState.errors.link?.message}
          {...form.register('link')}
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
