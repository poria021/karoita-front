'use client';

import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';
import { Controller } from 'react-hook-form';

import { KvSelectField } from '@/components/shared/fields/KvSelectField';
import { KvSelectItem } from '@/components/shared/fields/KvSelect';
import { KvTextField } from '@/components/shared/fields/KvTextField';
import type { OrgCity, OrgDistrict, OrgProvince } from '@/types/org-structure';
import type { OrgStructureSubTab } from '@/types/org-structure';

import { SCHOOL_GENDER_OPTIONS } from '../constants';
import type { OrgEntityFormValues } from './OrgStructureEntityModal';

/** Select portal above dialog overlay (rule 30 nested portals). */
const SELECT_IN_DIALOG_Z = 'z-[150]';

interface OrgStructureEntityFieldsProps {
  tab: OrgStructureSubTab;
  register: UseFormRegister<OrgEntityFormValues>;
  control: Control<OrgEntityFormValues>;
  setValue: UseFormSetValue<OrgEntityFormValues>;
  errors: FieldErrors<OrgEntityFormValues>;
  provinces: OrgProvince[];
  cities: OrgCity[];
  districts: OrgDistrict[];
  provinceId?: string;
  cityId?: string;
}

export function OrgStructureEntityFields({
  tab,
  register,
  control,
  setValue,
  errors,
  provinces,
  cities,
  districts,
  provinceId,
  cityId,
}: OrgStructureEntityFieldsProps) {
  const needsProvince =
    tab === 'cities' ||
    tab === 'faculties' ||
    tab === 'districts' ||
    tab === 'schools';
  const needsCity =
    tab === 'faculties' || tab === 'districts' || tab === 'schools';

  return (
    <>
      <KvTextField
        id="org-entity-name"
        label="نام"
        required
        error={errors.name?.message}
        {...register('name')}
      />

      {needsProvince ? (
        <Controller
          name="provinceId"
          control={control}
          render={({ field }) => (
            <KvSelectField
              id="org-entity-province"
              label="استان"
              required
              error={errors.provinceId?.message}
              placeholder="انتخاب استان"
              value={field.value || ''}
              onValueChange={(value) => {
                field.onChange(value);
                setValue('cityId', '');
                setValue('districtId', '');
              }}
              contentClassName={SELECT_IN_DIALOG_Z}
            >
              {provinces.map((p) => (
                <KvSelectItem key={p.id} value={p.id}>
                  {p.name}
                </KvSelectItem>
              ))}
            </KvSelectField>
          )}
        />
      ) : null}

      {needsCity ? (
        <Controller
          name="cityId"
          control={control}
          render={({ field }) => (
            <KvSelectField
              id="org-entity-city"
              label="شهر"
              required
              placeholder="انتخاب شهر"
              value={field.value || ''}
              onValueChange={(value) => {
                field.onChange(value);
                setValue('districtId', '');
              }}
              disabled={!provinceId}
              error={errors.cityId?.message}
              contentClassName={SELECT_IN_DIALOG_Z}
            >
              {cities.map((c) => (
                <KvSelectItem key={c.id} value={c.id}>
                  {c.name}
                </KvSelectItem>
              ))}
            </KvSelectField>
          )}
        />
      ) : null}

      {tab === 'schools' ? (
        <>
          <Controller
            name="districtId"
            control={control}
            render={({ field }) => (
              <KvSelectField
                id="org-entity-district"
                label="منطقه آموزشی"
                required
                placeholder="انتخاب منطقه"
                value={field.value || ''}
                onValueChange={field.onChange}
                disabled={!cityId}
                error={errors.districtId?.message}
                contentClassName={SELECT_IN_DIALOG_Z}
              >
                {districts.map((d) => (
                  <KvSelectItem key={d.id} value={d.id}>
                    {d.name}
                  </KvSelectItem>
                ))}
              </KvSelectField>
            )}
          />
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <KvSelectField
                id="org-entity-gender"
                label="نوع مدرسه"
                required
                placeholder="انتخاب نوع"
                value={field.value || ''}
                onValueChange={field.onChange}
                error={errors.gender?.message}
                contentClassName={SELECT_IN_DIALOG_Z}
              >
                {SCHOOL_GENDER_OPTIONS.map((opt) => (
                  <KvSelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </KvSelectItem>
                ))}
              </KvSelectField>
            )}
          />
        </>
      ) : null}
    </>
  );
}
