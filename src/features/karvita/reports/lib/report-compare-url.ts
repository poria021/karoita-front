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
