'use client';

import type { Control, FieldErrors } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import { KvSelectItem } from '@/components/shared/fields/KvSelect';
import { KvSelectField } from '@/components/shared/fields/KvSelectField';
import type { OrganizationOption } from '@/services/organization-options.service';

import type { AdminUserCreationFormInput } from '../schemas/admin-user-creation.schema';

type AdminUserCreationOrgFieldsProps = {
  control: Control<AdminUserCreationFormInput>;
  errors: FieldErrors<AdminUserCreationFormInput>;
  needsRegional: boolean;
  needsCollege: boolean;
  needsProvinceRole: boolean;
  province: string;
  city: string;
  loadingProvinces: boolean;
  provinces: OrganizationOption[];
  cities: OrganizationOption[];
  colleges: OrganizationOption[];
  districts: OrganizationOption[];
  onProvinceChange: (value: string) => void;
  onCityChange: (value: string) => void;
};

export function AdminUserCreationOrgFields({
  control,
  errors,
  needsRegional,
  needsCollege,
  needsProvinceRole,
  province,
  city,
  loadingProvinces,
  provinces,
  cities,
  colleges,
  districts,
  onProvinceChange,
  onCityChange,
}: AdminUserCreationOrgFieldsProps) {
  if (needsRegional) {
    return (
      <div className="grid grid-cols-1 gap-kv-field sm:col-span-2 sm:grid-cols-3">
        <Controller
          name="province"
          control={control}
          render={({ field }) => (
            <KvSelectField
              id="admin-user-province-regional"
              label="استان تابعه"
              required
              disabled={loadingProvinces}
              placeholder="انتخاب استان..."
              value={field.value || ''}
              onValueChange={onProvinceChange}
              error={errors.province?.message}
            >
              {provinces.map((item) => (
                <KvSelectItem key={item.id} value={item.label}>
                  {item.label}
                </KvSelectItem>
              ))}
            </KvSelectField>
          )}
        />

        <Controller
          name="city"
          control={control}
          render={({ field }) => (
            <KvSelectField
              id="admin-user-city"
              label="شهر تابعه"
              required
              locked={!province}
              placeholder="انتخاب شهر..."
              value={field.value || ''}
              onValueChange={onCityChange}
              error={errors.city?.message}
            >
              {cities.map((item) => (
                <KvSelectItem key={item.id} value={item.label}>
                  {item.label}
                </KvSelectItem>
              ))}
            </KvSelectField>
          )}
        />

        <Controller
          name="district"
          control={control}
          render={({ field }) => (
            <KvSelectField
              id="admin-user-district"
              label="منطقه آموزشی متصل"
              required
              locked={!city}
              placeholder="انتخاب منطقه..."
              value={field.value || ''}
              onValueChange={field.onChange}
              error={errors.district?.message}
            >
              {districts.map((item) => (
                <KvSelectItem key={item.id} value={item.label}>
                  {item.label}
                </KvSelectItem>
              ))}
            </KvSelectField>
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
          ? 'grid grid-cols-1 gap-kv-field sm:col-span-2 sm:grid-cols-2'
          : 'sm:col-span-2'
      }
    >
      <Controller
        name="province"
        control={control}
        render={({ field }) => (
          <KvSelectField
            id="admin-user-province"
            label="استان مربوطه"
            required
            disabled={loadingProvinces}
            placeholder="انتخاب استان..."
            value={field.value || ''}
            onValueChange={onProvinceChange}
            error={errors.province?.message}
          >
            {provinces.map((item) => (
              <KvSelectItem key={item.id} value={item.label}>
                {item.label}
              </KvSelectItem>
            ))}
          </KvSelectField>
        )}
      />

      {needsCollege ? (
        <Controller
          name="college"
          control={control}
          render={({ field }) => (
            <KvSelectField
              id="admin-user-college"
              label="دانشکده / پردیس متصل"
              required
              locked={!province}
              placeholder="انتخاب پردیس..."
              value={field.value || ''}
              onValueChange={field.onChange}
              error={errors.college?.message}
            >
              {colleges.map((item) => (
                <KvSelectItem key={item.id} value={item.label}>
                  {item.label}
                </KvSelectItem>
              ))}
            </KvSelectField>
          )}
        />
      ) : null}
    </div>
  );
}
