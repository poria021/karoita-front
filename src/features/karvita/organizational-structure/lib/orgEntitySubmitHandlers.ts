import { OrgStructureService } from '@/services/org-structure.service';
import type { OrgStructureSubTab } from '@/types/org-structure';

import type { OrgEntityFormValues } from '../schemas/org-structure.schema';

type SubmitHandler = (
  values: OrgEntityFormValues,
  editId?: string
) => Promise<void>;

const SUBMIT_HANDLERS: Record<OrgStructureSubTab, SubmitHandler> = {
  provinces: async (values, editId) => {
    await OrgStructureService.upsertProvince({ name: values.name }, editId);
  },
  cities: async (values, editId) => {
    await OrgStructureService.upsertCity(
      { name: values.name, provinceId: values.provinceId! },
      editId
    );
  },
  faculties: async (values, editId) => {
    await OrgStructureService.upsertFaculty(
      {
        name: values.name,
        provinceId: values.provinceId!,
        cityId: values.cityId!,
      },
      editId
    );
  },
  districts: async (values, editId) => {
    await OrgStructureService.upsertDistrict(
      {
        name: values.name,
        provinceId: values.provinceId!,
        // cityId is optional — omit entirely when empty so the API doesn't
        // receive an empty string and return a 422.
        ...(values.cityId ? { cityId: values.cityId } : {}),
      },
      editId
    );
  },
  schools: async (values, editId) => {
    await OrgStructureService.upsertSchool(
      {
        name: values.name,
        provinceId: values.provinceId!,
        cityId: values.cityId!,
        districtId: values.districtId!,
        gender: values.gender!,
      },
      editId
    );
  },
  majors: async (values, editId) => {
    await OrgStructureService.upsertMajor(
      { name: values.name, audience: values.audience, roleId: values.roleId },
      editId
    );
  },
};

export async function submitOrgEntity(
  tab: OrgStructureSubTab,
  values: OrgEntityFormValues,
  editId: string | null
): Promise<void> {
  const handler = SUBMIT_HANDLERS[tab];
  await handler(values, editId ?? undefined);
}
