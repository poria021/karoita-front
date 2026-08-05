'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { KvImageDocUploader } from '@/components/shared/fields/KvImageDocUploader';
import { KvTextField } from '@/components/shared/fields/KvTextField';
import { KvTableCell } from '@/components/shared/table/KvTable';
import { LandingCmsService } from '@/services/landing-cms.service';
import type { LandingBanner } from '@/types/landing-cms';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { getLandingCmsTabConfig } from '../constants';
import {
  bannerFormSchema,
  type BannerFormInput,
  type BannerFormValues,
} from '../schemas/landing-cms.schema';
import type { LandingCmsDeleteTarget } from '../hooks/useLandingCmsPage';
import { LandingCmsEntityTable } from './LandingCmsEntityTable';
import { LandingCmsMediaThumb } from './LandingCmsMediaThumb';

const BANNER_COLUMNS = [
  { key: 'image', label: 'تصویر', align: 'center' as const, className: 'w-24' },
  { key: 'title', label: 'عنوان بنر' },
  { key: 'link', label: 'لینک هدف' },
] as const;

type LandingCmsBannersPanelProps = {
  items: LandingBanner[];
  isLoading: boolean;
  onSoftReload: () => Promise<void>;
  onRequestDelete: (target: LandingCmsDeleteTarget) => void;
};

export function LandingCmsBannersPanel({
  items,
  isLoading,
  onSoftReload,
  onRequestDelete,
}: LandingCmsBannersPanelProps) {
  const tabConfig = getLandingCmsTabConfig('banners');
  const form = useForm<BannerFormInput, unknown, BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: { title: '', link: '', image: null },
    mode: 'onSubmit',
  });

  const submit = form.handleSubmit(async (values) => {
    try {
      await LandingCmsService.createBanner({
        title: values.title,
        link: values.link || undefined,
        image: values.image,
      });
      toast.success('بنر جدید با موفقیت به اسلایدر اضافه شد.');
      form.reset({ title: '', link: '', image: null });
      await onSoftReload();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'افزودن بنر ناموفق بود.'
      );
    }
  });

  return (
    <div className="grid grid-cols-1 gap-kv-section lg:grid-cols-12 lg:items-start">
      <form
        onSubmit={submit}
        noValidate
        className="flex flex-col gap-kv-group rounded-kv-panel border border-kv-border bg-kv-surface-muted/40 p-kv-group lg:col-span-5"
      >
        <div className="flex items-center gap-kv-inline">
          <FaIcon icon={faIcons.plus} size="xs" className="text-kv-text-muted" />
          <KvTypography variant="subtitle" as="h2">
            افزودن بنر جدید
          </KvTypography>
        </div>

        <Controller
          name="image"
          control={form.control}
          render={({ field, fieldState }) => (
            <KvImageDocUploader
              value={field.value}
              onChange={field.onChange}
              label="تصویر بنر"
              error={fieldState.error?.message}
              helperText="PNG، JPG تا ۱۰ مگابایت"
              previewAlt="پیش‌نمایش بنر"
            />
          )}
        />

        <KvTextField
          id="landing-banner-title"
          label="عنوان / توضیحات بنر"
          required
          placeholder="مثال: بنر اطلاع‌رسانی کارورزی"
          error={form.formState.errors.title?.message}
          {...form.register('title')}
        />

        <KvTextField
          id="landing-banner-link"
          label="لینک هدف"
          optionalHint
          dir="ltr"
          placeholder="مثال: #internship یا https://..."
          error={form.formState.errors.link?.message}
          {...form.register('link')}
        />

        <KvButton
          type="submit"
          color="cta"
          loading={form.formState.isSubmitting}
          className="w-full"
        >
          افزودن بنر به اسلایدر
        </KvButton>
      </form>

      <div className="flex flex-col gap-kv-group lg:col-span-7">
        <KvTypography variant="subtitle" as="h2">
          جدول بنرهای فعال اسلایدر اصلی (
          {toPersianDigits(String(items.length))})
        </KvTypography>
        <LandingCmsEntityTable
          resetKey="banners"
          columns={BANNER_COLUMNS}
          items={items}
          isLoading={isLoading}
          emptyTitle={tabConfig.emptyTitle}
          emptyDescription={tabConfig.emptyDescription}
          deleteAriaLabel={(row) => `حذف بنر ${row.title}`}
          onDelete={(row) =>
            onRequestDelete({
              kind: 'banners',
              id: row.id,
              label: row.title,
            })
          }
          renderCells={(row) => (
            <>
              <KvTableCell align="center">
                <LandingCmsMediaThumb
                  imageUrl={row.imageUrl}
                  alt={row.title}
                  variant="banner"
                />
              </KvTableCell>
              <KvTableCell emphasis>{row.title}</KvTableCell>
              <KvTableCell
                className="max-w-[12rem] truncate font-mono text-xs text-kv-text-muted"
                dir="ltr"
              >
                {row.link || 'بدون لینک (صرفاً نمایش)'}
              </KvTableCell>
            </>
          )}
        />
      </div>
    </div>
  );
}
