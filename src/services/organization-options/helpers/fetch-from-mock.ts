import { toMockMajorAudience } from '@/services/organization-options/degree-catalog-role';
import { OrgStructureService } from '@/services/org-structure.service';

import {
  filterByQuery,
  paginateBare,
  type OrganizationOption,
  type OrganizationOptionsResult,
  type ResolvedOptionsRequest,
} from './types';

const MOCK_DELAY_MS = 220;

function toOptions(labels: string[]): OrganizationOption[] {
  return labels.map((label) => ({ id: label, label }));
}

export async function fetchOrganizationOptionsFromMock(
  params: ResolvedOptionsRequest
): Promise<OrganizationOptionsResult> {
  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, MOCK_DELAY_MS);
    params.signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true }
    );
  });

  const provinceStr = Array.isArray(params.province) ? (params.province[0] ?? '') : (params.province ?? '');
  const districtStr = Array.isArray(params.district) ? (params.district[0] ?? '') : (params.district ?? '');
  const labels = OrgStructureService.listLabelsForField(
    params.type,
    provinceStr,
    districtStr,
    params.type === 'major' && params.role
      ? toMockMajorAudience(params.role)
      : undefined
  );
  const filtered = filterByQuery(toOptions(labels), params.query ?? '');
  return paginateBare(filtered, params.page, params.limit);
}
