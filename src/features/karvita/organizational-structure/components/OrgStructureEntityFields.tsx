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
import { IS_MOCK_MODE } from '@/lib/api-mode';
import type { OrgCity, OrgDistrict, OrgProvince, OrgRole } from '@/types/org-structure';
import type { OrgStructureSubTab } from '@/types/org-structure';

import { MAJOR_AUDIENCE_OPTIONS, SCHOOL_GENDER_OPTIONS } from '../constants';
import type { OrgEntityFormValues } from '../schemas/org-structure.schema';

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
  roles: OrgRole[];
  namePlaceholder: string;
  /**
   * وقتی استان انتخاب‌شده شهری ندارد (کوئری تمام و نتیجه خالی).
   * select شهر در فرم منطقه/مدرسه قفل می‌شود تا بدون شهر هم بتوان submit کرد.
   */
  provinceHasNoCities?: boolean;
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
  roles,
  namePlaceholder,
  provinceHasNoCities = false,
}: OrgStructureEntityFieldsProps) {
  const needsProvince =
    tab === 'cities' ||
    tab === 'faculties' ||
    tab === 'districts' ||
    tab === 'schools';
  const needsCity = tab === 'districts' || tab === 'schools';

  // شهر در منطقه / مدرسه اختیاری است. پردیس فقط استان می‌خواهد.
  // اگر استان شهری نداشته باشد فیلد قفل می‌شود.
  const cityIsLocked = needsCity && provinceHasNoCities;

  return (
    <>
      <KvTextField
        id="org-entity-name"
        label="نام"
        required
        placeholder={namePlaceholder}
        error={errors.name?.message}
        scriptGuard="persian-name"
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
              optionalHint
              locked={cityIsLocked}
              hint={
                cityIsLocked
                  ? 'این استان شهر ثبت‌شده‌ای ندارد.'
                  : undefined
              }
              placeholder={cityIsLocked ? '—' : 'انتخاب شهر'}
              value={cityIsLocked ? '' : (field.value || '')}
              onValueChange={
                cityIsLocked
                  ? undefined
                  : (value) => {
                      field.onChange(value);
                      setValue('districtId', '');
                    }
              }
              error={cityIsLocked ? undefined : errors.cityId?.message}
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
                optionalHint
                placeholder="انتخاب منطقه"
                value={field.value || ''}
                onValueChange={field.onChange}
                error={errors.districtId?.message}
                contentClassName={SELECT_IN_DIALOG_Z}
                displayValue={
                  districts.find((d) => d.id === field.value)?.name
                }
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

      {tab === 'majors' ? (
        IS_MOCK_MODE ? (
          <Controller
            name="audience"
            control={control}
            render={({ field }) => (
              <KvSelectField
                id="org-entity-major-audience"
                label="مخاطب رشته"
                required
                placeholder="انتخاب مخاطب"
                value={field.value || ''}
                onValueChange={field.onChange}
                error={errors.audience?.message}
                contentClassName={SELECT_IN_DIALOG_Z}
              >
                {MAJOR_AUDIENCE_OPTIONS.map((opt) => (
                  <KvSelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </KvSelectItem>
                ))}
              </KvSelectField>
            )}
          />
        ) : (
          <Controller
            name="roleId"
            control={control}
            render={({ field }) => (
              <KvSelectField
                id="org-entity-major-role"
                label="نقش"
                required
                placeholder="انتخاب نقش"
                value={field.value || ''}
                onValueChange={field.onChange}
                error={errors.roleId?.message}
                contentClassName={SELECT_IN_DIALOG_Z}
              >
                {roles.map((r) => (
                  <KvSelectItem key={r.id} value={r.id}>
                    {r.name}
                  </KvSelectItem>
                ))}
              </KvSelectField>
            )}
          />
        )
      ) : null}
    </>
  );
}
