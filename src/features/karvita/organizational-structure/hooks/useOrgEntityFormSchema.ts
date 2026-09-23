import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { IS_MOCK_MODE } from '@/lib/api-mode';
import type { OrgStructureSubTab } from '@/types/org-structure';

import {
  cityFormSchema,
  districtFormSchema,
  facultyFormSchema,
  majorFormSchema,
  provinceFormSchema,
  schoolFormSchema,
  type OrgEntityFormValues,
} from '../schemas/org-structure.schema';

function defaultValuesForTab(tab: OrgStructureSubTab): OrgEntityFormValues {
  if (tab === 'provinces') return { name: '' };
  if (tab === 'majors') {
    return IS_MOCK_MODE
      ? { name: '', audience: undefined }
      : { name: '', roleId: '' };
  }
  if (tab === 'cities') {
    return { name: '', provinceId: '' };
  }
  if (tab === 'faculties') {
    return { name: '', provinceId: '', cityId: '' };
  }
  if (tab === 'schools') {
    return {
      name: '',
      provinceId: '',
      cityId: '',
      districtId: '',
      gender: undefined,
    };
  }
  return { name: '', provinceId: '', cityId: '' };
}

function resolverForTab(
  tab: OrgStructureSubTab
): Resolver<OrgEntityFormValues> {
  if (tab === 'provinces') {
    return zodResolver(provinceFormSchema) as Resolver<OrgEntityFormValues>;
  }
  if (tab === 'cities') {
    return zodResolver(cityFormSchema) as Resolver<OrgEntityFormValues>;
  }
  if (tab === 'faculties') {
    return zodResolver(facultyFormSchema) as Resolver<OrgEntityFormValues>;
  }
  if (tab === 'districts') {
    return zodResolver(districtFormSchema) as Resolver<OrgEntityFormValues>;
  }
  if (tab === 'schools') {
    return zodResolver(schoolFormSchema) as Resolver<OrgEntityFormValues>;
  }
  return zodResolver(majorFormSchema) as Resolver<OrgEntityFormValues>;
}

/** انتخاب schema/defaultValues فرم بر اساس تب — بدون هیچ state یا query. */
export function useOrgEntityFormSchema(tab: OrgStructureSubTab) {
  return {
    defaultValues: defaultValuesForTab(tab),
    resolver: resolverForTab(tab),
  };
}

export { defaultValuesForTab };
