'use client';

import { useForm, useWatch } from 'react-hook-form';

import type { OrgStructureListItem } from '@/services/org-structure.service';
import type {
  OrgStructureEntityKind,
  OrgStructureSubTab,
} from '@/types/org-structure';

import { useOrgEntityEditHydration } from './useOrgEntityEditHydration';
import { useOrgEntityFormSchema } from './useOrgEntityFormSchema';
import { useOrgHierarchyQueries } from './useOrgHierarchyQueries';
import type { OrgEntityFormValues } from '../schemas/org-structure.schema';

type UseOrgEntityFormParams = {
  open: boolean;
  tab: OrgStructureSubTab;
  entityKind: OrgStructureEntityKind;
  editId: string | null;
  editRow: OrgStructureListItem | null;
};

export function useOrgEntityForm({
  open,
  tab,
  entityKind,
  editId,
  editRow,
}: UseOrgEntityFormParams) {
  const { defaultValues, resolver } = useOrgEntityFormSchema(tab);

  const form = useForm<OrgEntityFormValues>({
    resolver,
    defaultValues,
    mode: 'onSubmit',
  });

  const provinceId = useWatch({
    control: form.control,
    name: 'provinceId',
  });
  const cityId = useWatch({
    control: form.control,
    name: 'cityId',
  });

  const { provinces, cities, districtsFromQuery, roles, provinceHasNoCities } =
    useOrgHierarchyQueries({ open, tab, provinceId, cityId });

  const districts = useOrgEntityEditHydration({
    form,
    open,
    tab,
    entityKind,
    editId,
    editRow,
    districtsFromQuery,
  });

  return {
    form,
    provinces,
    cities,
    districts,
    roles,
    provinceHasNoCities,
  };
}
