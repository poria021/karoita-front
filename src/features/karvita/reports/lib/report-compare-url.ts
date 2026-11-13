import { REPORT_COMPARE_ENABLED } from '@/features/karvita/reports/constants';

/**
 * حالت صفحهٔ مقایسه روی همان مسیر گزارش با `?view=compare`.
 * اسلاگ گزارش در pathname است؛ این پارامتر فقط حالت UI را مشخص می‌کند.
 * شناسه‌های انتخاب‌شده در `?cmp=id1,id2` می‌مانند تا رفرش داده را نگه دارد.
 */
export const REPORT_VIEW_PARAM = 'view';
export const REPORT_VIEW_COMPARE = 'compare';
export const REPORT_VIEW_LIST = 'list';
export const REPORT_COMPARE_IDS_PARAM = 'cmp';
/** تب نظام ترمی / پودمانی — مثل بقیهٔ تب‌های داشبورد با `?tab=`. */
export const REPORT_PERIOD_MODE_PARAM = 'tab';
export const REPORT_PERIOD_MODE_TERM = 'term';
export const REPORT_PERIOD_MODE_MODULE = 'module';

export const REPORT_VIEW_VALUES = [
  REPORT_VIEW_LIST,
  REPORT_VIEW_COMPARE,
] as const;

export const REPORT_PERIOD_MODE_VALUES = [
  REPORT_PERIOD_MODE_TERM,
  REPORT_PERIOD_MODE_MODULE,
] as const;

export type ReportViewParam = (typeof REPORT_VIEW_VALUES)[number];

export function isReportCompareView(
  raw: string | null | undefined
): boolean {
  return raw === REPORT_VIEW_COMPARE;
}

type SearchReader = {
  get(name: string): string | null;
};

/** آیا query نشانهٔ صفحه/حالت مقایسه دارد؟ */
export function hasReportCompareQuery(search: SearchReader): boolean {
  return (
    isReportCompareView(search.get(REPORT_VIEW_PARAM)) ||
    Boolean(search.get(REPORT_COMPARE_IDS_PARAM)?.trim())
  );
}

/**
 * وقتی مقایسه خاموش است، `view=compare` و `cmp` را از query برمی‌دارد
 * و href همان گزارش (صفحهٔ قبل از مقایسه) را برمی‌گرداند.
 * اگر تغییری لازم نباشد → `null`.
 */
export function hrefWithoutDisabledReportCompare(
  pathname: string,
  search: URLSearchParams | string
): string | null {
  if (REPORT_COMPARE_ENABLED) return null;
  const params =
    typeof search === 'string'
      ? new URLSearchParams(
          search.startsWith('?') ? search.slice(1) : search
        )
      : new URLSearchParams(search.toString());
  if (!hasReportCompareQuery(params)) return null;

  if (isReportCompareView(params.get(REPORT_VIEW_PARAM))) {
    params.delete(REPORT_VIEW_PARAM);
  }
  params.delete(REPORT_COMPARE_IDS_PARAM);

  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

/** از Record سرور Next (`searchParams`) به URLSearchParams. */
export function searchParamsRecordToUrlSearchParams(
  record: Record<string, string | string[] | undefined>
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    if (value == null) continue;
    const raw = Array.isArray(value) ? value[0] : value;
    if (raw == null || raw === '') continue;
    params.set(key, raw);
  }
  return params;
}

/** `cmp=a,b,c` → شناسه‌های یکتا تا سقف max. */
export function parseReportCompareIds(
  raw: string | null | undefined,
  max: number
): string[] {
  if (!raw || max <= 0) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(',')) {
    const id = part.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= max) break;
  }
  return out;
}

/** برای نوشتن در query؛ خالی → null تا کلید حذف شود. */
export function serializeReportCompareIds(
  ids: readonly string[]
): string | null {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    const cleaned = id.trim();
    if (!cleaned || seen.has(cleaned)) continue;
    seen.add(cleaned);
    out.push(cleaned);
  }
  return out.length > 0 ? out.join(',') : null;
}
