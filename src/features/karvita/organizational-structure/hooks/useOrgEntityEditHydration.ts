import { useEffect, useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { IS_MOCK_MODE } from '@/lib/api-mode';
import { OrgStructureService } from '@/services/org-structure.service';
import type { OrgStructureListItem } from '@/services/org-structure.service';
import type {
  OrgCity,
  OrgDistrict,
  OrgMajor,
  OrgSchool,
  OrgStructureEntityKind,
  OrgStructureSubTab,
} from '@/types/org-structure';

import { defaultValuesForTab } from './useOrgEntityFormSchema';
import type { OrgEntityFormValues } from '../schemas/org-structure.schema';

/**
 * مقادیر `reset()` را از ردیف جدول بساز تا ویرایش به `getEntity()` دوم وابسته نباشد.
 * در real فقط `province` واقعاً resolve می‌شود؛ بقیه kindها silent no-op می‌مانند.
 *
 * ردیف real همیشه کلید FK دارد (`provinceId`/`cityId`/…) حتی اگر `''` باشد.
 * ردیف mock اصلاً آن کلیدها را ندارد (فقط برچسب `*Name`).
 * پس چک درست `=== undefined` است نه falsy — وگرنه ردیف real با یک رابطهٔ خالی هم رد می‌شود.
 */
function valuesFromRow(
  kind: OrgStructureEntityKind,
  row: OrgStructureListItem
): OrgEntityFormValues | null {
  if (kind === 'province') {
    return { name: row.name };
  }
  if (kind === 'major') {
    if (IS_MOCK_MODE) {
      if (row.audience === undefined) return null;
      return { name: row.name, audience: row.audience };
    }
    if (row.roleId === undefined) return null;
    return { name: row.name, roleId: row.roleId };
  }
  if (kind === 'city') {
    if (row.provinceId === undefined) return null;
    return { name: row.name, provinceId: row.provinceId };
  }
  if (kind === 'faculty') {
    if (row.provinceId === undefined || row.cityId === undefined) return null;
    return { name: row.name, provinceId: row.provinceId, cityId: row.cityId };
  }
  if (kind === 'district') {
    if (row.provinceId === undefined || row.cityId === undefined) return null;
    return { name: row.name, provinceId: row.provinceId, cityId: row.cityId };
  }
  if (kind === 'school') {
    if (
      row.provinceId === undefined ||
      row.cityId === undefined ||
      row.districtId === undefined ||
      row.gender === undefined
    ) {
      return null;
    }
    return {
      name: row.name,
      provinceId: row.provinceId,
      cityId: row.cityId,
      districtId: row.districtId,
      gender: row.gender,
    };
  }
  return null;
}

type UseOrgEntityEditHydrationParams = {
  form: UseFormReturn<OrgEntityFormValues>;
  open: boolean;
  tab: OrgStructureSubTab;
  entityKind: OrgStructureEntityKind;
  editId: string | null;
  editRow: OrgStructureListItem | null;
  districtsFromQuery: OrgDistrict[];
};

/**
 * مقداردهی فرم هنگام باز شدن مودال ویرایش: از ردیف جدول (سریع) یا fallback به
 * `getEntity()` (وقتی ردیف کلید FK لازم را ندارد)، به‌علاوهٔ تزریق districtِ در
 * حال ویرایش به لیست اگر در نتیجهٔ کوئری نبود.
 */
export function useOrgEntityEditHydration({
  form,
  open,
  tab,
  entityKind,
  editId,
  editRow,
  districtsFromQuery,
}: UseOrgEntityEditHydrationParams): OrgDistrict[] {
  const editDistrictId = editRow?.districtId;
  const editDistrictName = editRow?.districtName;
  const editDistrictProvinceId = editRow?.provinceId ?? '';
  const editDistrictCityId = editRow?.cityId ?? '';

  const districts = useMemo((): OrgDistrict[] => {
    if (
      editDistrictId &&
      editDistrictName &&
      !districtsFromQuery.some((d) => d.id === editDistrictId)
    ) {
      return [
        ...districtsFromQuery,
        {
          id: editDistrictId,
          name: editDistrictName,
          provinceId: editDistrictProvinceId,
          cityId: editDistrictCityId,
        },
      ];
    }
    return districtsFromQuery;
  }, [
    districtsFromQuery,
    editDistrictId,
    editDistrictName,
    editDistrictProvinceId,
    editDistrictCityId,
  ]);

  useEffect(() => {
    if (!open) return;

    // اول *مقادیر* فرم را پر کن — منتظر کوئری استان نمان؛ آن فقط optionهای select است.
    if (!editId) {
      form.reset(defaultValuesForTab(tab));
      return;
    }

    if (editRow) {
      const rowValues = valuesFromRow(entityKind, editRow);
      if (rowValues) {
        form.reset(rowValues);
        return;
      }
    }

    // فقط fallback: ردیف قابل‌استفاده نیست (mock کلید FK ندارد).
    let cancelled = false;
    const fetchTimer = window.setTimeout(() => {
      void (async () => {
        const entity = await OrgStructureService.getEntity(entityKind, editId);
        if (!entity || cancelled) return;

        if (entityKind === 'province') {
          form.reset({ name: entity.name });
          return;
        }

        if (entityKind === 'major') {
          const major = entity as OrgMajor;
          form.reset({ name: major.name, audience: major.audience });
          return;
        }

        if (entityKind === 'city') {
          const city = entity as OrgCity;
          form.reset({ name: city.name, provinceId: city.provinceId });
          return;
        }

        if (entityKind === 'faculty') {
          const faculty = entity as {
            name: string;
            provinceId: string;
            cityId: string;
          };
          form.reset({
            name: faculty.name,
            provinceId: faculty.provinceId,
            cityId: faculty.cityId,
          });
          return;
        }

        if (entityKind === 'school') {
          const school = entity as OrgSchool;
          form.reset({
            name: school.name,
            provinceId: school.provinceId,
            cityId: school.cityId,
            districtId: school.districtId,
            gender: school.gender,
          });
          return;
        }

        const row = entity as {
          name: string;
          provinceId: string;
          cityId: string;
        };

        form.reset({
          name: row.name,
          provinceId: row.provinceId,
          cityId: row.cityId,
        });
      })();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(fetchTimer);
    };
  }, [editId, editRow, entityKind, form, open, tab]);

  useEffect(() => {
    if (!open || tab !== 'schools' || !editId) return;
    if (form.getValues('districtId')) return;
    if (editRow?.districtId) {
      form.setValue('districtId', editRow.districtId);
      return;
    }
    const label = editRow?.districtName?.trim();
    if (!label) return;
    const match = districts.find((d) => d.name === label);
    if (match) form.setValue('districtId', match.id);
  }, [open, tab, editId, editRow, districts, form]);

  return districts;
}
