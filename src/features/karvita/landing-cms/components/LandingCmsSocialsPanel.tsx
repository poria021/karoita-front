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
  CreateLandingSocialInput,
  LandingSocial,
} from '@/types/landing-cms';
import { faIcons } from '@/utils/iconMap';

import {
  getLandingCmsTabConfig,
  LANDING_ICON_MAX_SIZE_MB,
  LANDING_SOCIAL_ICON_MAX_SIZE_HELPER,
} from '../constants';
import type { LandingCmsDeleteTarget } from '../hooks/useLandingCmsPage';
import {
  socialFormSchema,
  type SocialFormInput,
  type SocialFormValues,
} from '../schemas/landing-cms.schema';
import { LandingCmsEntityTable } from './LandingCmsEntityTable';
import { LandingCmsMediaThumb } from './LandingCmsMediaThumb';

const SOCIAL_COLUMNS = [
  { key: 'icon', label: 'آیکون', align: 'center' as const, className: 'w-20' },
  { key: 'name', label: 'نام شبکه' },
  { key: 'link', label: 'لینک اختصاصی' },
] as const;

type LandingCmsSocialsPanelProps = {
  items: LandingSocial[];
  isLoading: boolean;
  onCreate: (input: CreateLandingSocialInput) => void;
  onRequestDelete: (target: LandingCmsDeleteTarget) => void;
};

export function LandingCmsSocialsPanel({
  items,
  isLoading,
  onCreate,
  onRequestDelete,
}: LandingCmsSocialsPanelProps) {
  const tabConfig = getLandingCmsTabConfig('socials');
  const form = useForm<SocialFormInput, unknown, SocialFormValues>({
    resolver: zodResolver(socialFormSchema),
    defaultValues: { name: '', link: '', iconImage: null },
    mode: 'onSubmit',
  });

  const submit = form.handleSubmit((values) => {
    onCreate({
      name: values.name,
      link: values.link,
      iconImage: values.iconImage ?? null,
    });
    form.reset({ name: '', link: '', iconImage: null });
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
            افزودن شبکه اجتماعی جدید
          </KvTypography>
        </div>

        <Controller
          name="iconImage"
          control={form.control}
          render={({ field, fieldState }) => (
            <KvImageDocUploader
              value={field.value ?? null}
              onChange={field.onChange}
              label={false}
              framed={false}
              error={fieldState.error?.message}
              maxSizeMb={LANDING_ICON_MAX_SIZE_MB}
              helperText={LANDING_SOCIAL_ICON_MAX_SIZE_HELPER}
              previewAlt="پیش‌نمایش آیکون شبکه"
            />
          )}
        />

        <KvTextField
          id="landing-social-name"
          label="نام شبکه اجتماعی"
          required
          placeholder="مثال: روبیکا / بله / ایتا"
          error={form.formState.errors.name?.message}
          {...form.register('name')}
        />

        <KvTextField
          id="landing-social-link"
          label="لینک شبکه اجتماعی"
          required
          dir="ltr"
          placeholder="مثال: https://eitaa.com/..."
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
          ثبت شبکه اجتماعی
        </KvButton>
      </form>

      <div className="lg:col-span-8">
        <LandingCmsEntityTable
          resetKey="socials"
          columns={SOCIAL_COLUMNS}
          items={items}
          isLoading={isLoading}
          emptyTitle={tabConfig.emptyTitle}
          emptyDescription={tabConfig.emptyDescription}
          deleteAriaLabel={(row) => `حذف شبکه ${row.name}`}
          onDelete={(row) =>
            onRequestDelete({
              kind: 'socials',
              id: row.id,
              label: row.name,
            })
          }
          renderCells={(row) => (
            <>
              <KvTableCell align="center">
                <LandingCmsMediaThumb
                  imageUrl={row.iconImageUrl || undefined}
                  iconStem={row.icon}
                  alt={row.name}
                />
              </KvTableCell>
              <KvTableCell emphasis>{row.name}</KvTableCell>
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
