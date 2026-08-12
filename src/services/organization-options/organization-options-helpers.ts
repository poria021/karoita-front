import { ApiClientError, apiClient } from '@/services/api-client';
import { OrgStructureService } from '@/services/org-structure.service';
import type { OrganizationField } from '@/utils/roleFieldStrategy';

export const ORGANIZATION_OPTIONS_DEFAULT_LIMIT = 10;
const MOCK_DELAY_MS = 220;

export type OrganizationOption = {
  id: string;
  label: string;
};

export type OrganizationOptionsResult = {
  items: OrganizationOption[];
  hasMore: boolean;
  page: number;
};

export type OrganizationOptionsQuery = {
  type: OrganizationField;
  query?: string;
  page?: number;
  limit?: number;
  province?: string;
  district?: string;
  signal?: AbortSignal;
};

export class OrganizationOptionsServiceError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = 'OrganizationOptionsServiceError';
  }
}

function toOptions(labels: string[]): OrganizationOption[] {
  return labels.map((label) => ({
    id: label,
    label,
  }));
}

function filterByQuery(
  items: OrganizationOption[],
  query: string
): OrganizationOption[] {
  const normalized = query.trim();
  if (!normalized) return items;
  return items.filter((item) => item.label.includes(normalized));
}

function paginate(
  items: OrganizationOption[],
  page: number,
  limit: number
): OrganizationOptionsResult {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const start = (safePage - 1) * safeLimit;
  const slice = items.slice(start, start + safeLimit);

  return {
    items: slice,
    hasMore: start + slice.length < items.length,
    page: safePage,
  };
}

type ResolvedOptionsRequest = Required<
  Pick<OrganizationOptionsQuery, 'type' | 'page' | 'limit'>
> &
  Pick<OrganizationOptionsQuery, 'query' | 'province' | 'district' | 'signal'>;

/** GET /organization-options?type&page&limit&q&province&district */
export async function fetchOrganizationOptionsFromApi(
  params: ResolvedOptionsRequest
): Promise<OrganizationOptionsResult> {
  if (!apiClient.isConfigured) {
    throw new OrganizationOptionsServiceError(
      'آدرس سرویس گزینه‌های سازمانی پیکربندی نشده است.'
    );
  }

  const search = new URLSearchParams({
    type: params.type,
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.query?.trim()) search.set('q', params.query.trim());
  if (params.province) search.set('province', params.province);
  if (params.district) search.set('district', params.district);

  try {
    const payload = await apiClient.getJson<Partial<OrganizationOptionsResult>>(
      `organization-options?${search.toString()}`,
      undefined,
      { signal: params.signal }
    );

    if (!Array.isArray(payload.items)) {
      throw new OrganizationOptionsServiceError(
        'پاسخ سرویس گزینه‌ها نامعتبر است.'
      );
    }

    return {
      items: payload.items.map((item) => ({
        id: String(item.id),
        label: String(item.label),
      })),
      hasMore: Boolean(payload.hasMore),
      page: typeof payload.page === 'number' ? payload.page : params.page,
    };
  } catch (error) {
    if (error instanceof OrganizationOptionsServiceError) throw error;
    if (error instanceof ApiClientError) {
      throw new OrganizationOptionsServiceError(
        error.message || 'دریافت گزینه‌های سازمانی ناموفق بود.',
        error.status
      );
    }
    throw error;
  }
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

  const labels = OrgStructureService.listLabelsForField(
    params.type,
    params.province ?? '',
    params.district ?? ''
  );
  const filtered = filterByQuery(toOptions(labels), params.query ?? '');
  return paginate(filtered, params.page, params.limit);
}
