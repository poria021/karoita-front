'use client';

import type { Control, FieldErrors } from 'react-hook-form';
import { Controller, useWatch } from 'react-hook-form';

import { KvSearchableOrganizationSelect } from '@/components/shared/fields/KvSearchableOrganizationSelect';

import type { AdminUserCreationFormInput } from '../schemas/admin-user-creation.schema';

type AdminUserCreationOrgFieldsProps = {
  control: Control<AdminUserCreationFormInput>;
  errors: FieldErrors<AdminUserCreationFormInput>;
  needsRegional: boolean;
  needsCollege: boolean;
  needsProvinceRole: boolean;
  onProvinceChange: (value: string) => void;
  onCityChange: (value: string) => void;
};

export function AdminUserCreationOrgFields({
  control,
  errors,
  needsRegional,
  needsCollege,
  needsProvinceRole,
  onProvinceChange,
  onCityChange,
}: AdminUserCreationOrgFieldsProps) {
  const province = useWatch({ control, name: 'province' }) ?? '';

  if (needsRegional) {
    return (
      <div className="grid grid-cols-1 gap-kv-group sm:col-span-2 sm:grid-cols-3">
        <Controller
          name="province"
          control={control}
          render={({ field }) => (
            <KvSearchableOrganizationSelect
              type="province"
              label="استان تابعه"
              required
              placeholder="جستجو و انتخاب استان..."
              value={field.value || ''}
              onChange={onProvinceChange}
              error={errors.province?.message}
            />
          )}
        />

        <Controller
          name="city"
          control={control}
          render={({ field }) => (
            <KvSearchableOrganizationSelect
              type="city"
              label="شهر تابعه"
              required
              placeholder="جستجو و انتخاب شهر..."
              value={field.value || ''}
              locked={!province}
              dependsOn={{ province }}
              onChange={onCityChange}
              error={errors.city?.message}
            />
          )}
        />

        <Controller
          name="district"
          control={control}
          render={({ field }) => (
            <KvSearchableOrganizationSelect
              type="district"
              label="منطقه آموزشی متصل"
              required
              placeholder="جستجو و انتخاب منطقه..."
              value={field.value || ''}
              locked={!province}
              dependsOn={{ province }}
              onChange={field.onChange}
              error={errors.district?.message}
            />
          )}
        />
      </div>
    );
  }

  if (!needsProvinceRole) return null;

  return (
    <div
      className={
        needsCollege
          ? 'grid grid-cols-1 gap-kv-group sm:col-span-2 sm:grid-cols-2'
          : 'sm:col-span-2'
      }
    >
      <Controller
        name="province"
        control={control}
        render={({ field }) => (
          <KvSearchableOrganizationSelect
            type="province"
            label="استان مربوطه"
            required
            placeholder="جستجو و انتخاب استان..."
            value={field.value || ''}
            onChange={onProvinceChange}
            error={errors.province?.message}
          />
        )}
      />

      {needsCollege ? (
        <Controller
          name="college"
          control={control}
          render={({ field }) => (
            <KvSearchableOrganizationSelect
              type="college"
              label="دانشکده / پردیس متصل"
              required
              placeholder="جستجو و انتخاب پردیس..."
              value={field.value || ''}
              locked={!province}
              dependsOn={{ province }}
              onChange={field.onChange}
              error={errors.college?.message}
            />
          )}
        />
      ) : null}
    </div>
  );
}
