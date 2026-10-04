import { toMockMajorAudience } from '@/services/organization-options/degree-catalog-role';
import { OrgStructureService } from '@/services/org-structure.service';

import {
  dedupeOptions,
  filterByQuery,
  paginateBare,
  toNameList,
  type OrganizationOption,
  type OrganizationOptionsResult,
  type ResolvedOptionsRequest,
} from './types';

const MOCK_DELAY_MS = 220;

function toOptions(labels: string[]): OrganizationOption[] {
  return labels.map((label) => ({ id: label, label }));
}

/**
 * برای فیلدهای چندانتخابی (استان/منطقه)، باید گزینه‌های تمام مقادیر انتخاب‌شده
 * ترکیب شوند نه فقط اولین مورد — وگرنه با انتخاب استان دوم، آبشاری متوقف می‌شود.
 */
function collectLabels(
  type: ResolvedOptionsRequest['type'],
  provinceNames: string[],
  districtNames: string[],
  majorAudience: ReturnType<typeof toMockMajorAudience> | undefined
): string[] {
  if (type === 'province' || type === 'major') {
    return OrgStructureService.listLabelsForField(type, '', '', majorAudience);
  }

  if (type === 'school') {
    // مدرسه به جفت (استان، منطقه) وابسته است؛ اگر منطقه‌ای انتخاب نشده باشد نتیجه‌ای ندارد.
    if (districtNames.length === 0) return [];
    const merged: string[] = [];
    const provinces = provinceNames.length > 0 ? provinceNames : [''];
    for (const districtName of districtNames) {
      for (const provinceName of provinces) {
        merged.push(
          ...OrgStructureService.listLabelsForField('school', provinceName, districtName)
        );
      }
    }
    return merged;
  }

  // city / college / district: به تمام استان‌های انتخاب‌شده وابسته‌اند.
  const provinces = provinceNames.length > 0 ? provinceNames : [''];
  const merged: string[] = [];
  for (const provinceName of provinces) {
    merged.push(...OrgStructureService.listLabelsForField(type, provinceName, ''));
  }
  return merged;
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

  const provinceNames = toNameList(params.province);
  const districtNames = toNameList(params.district);
  const labels = collectLabels(
    params.type,
    provinceNames,
    districtNames,
    params.type === 'major' && params.role
      ? toMockMajorAudience(params.role)
      : undefined
  );
  const filtered = filterByQuery(
    dedupeOptions(toOptions(labels)),
    params.query ?? ''
  );
  return paginateBare(filtered, params.page, params.limit);
}
