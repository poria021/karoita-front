import type { ReportRow } from '@/types/reports';

const AVERAGED_KEYS = ['score', 'att', 'resp'] as const;

function mean(values: number[]): number | undefined {
  return values.length === 0
    ? undefined
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * ردیف‌های هم‌شناسه (یک استان/مدرسه/استاد که در نیم‌سال ترمی و پودمانی هر دو
 * آمده) را یکی می‌کند: بقیهٔ فیلدها از اولین ردیف، و نمره/حضور/نرخ پاسخ
 * میانگین مقدارهای عددی. ترتیب اولین دیده‌شدن حفظ می‌شود.
 */
export function mergeRowsById(rows: readonly ReportRow[]): ReportRow[] {
  const groups = new Map<string, ReportRow[]>();
  for (const row of rows) {
    const group = groups.get(row.id);
    if (group) group.push(row);
    else groups.set(row.id, [row]);
  }
  return [...groups.values()].map((group) => {
    if (group.length === 1) return group[0]!;
    const merged: ReportRow = { ...group[0]! };
    for (const key of AVERAGED_KEYS) {
      const values = group
        .map((row) => (row as Record<string, unknown>)[key])
        .filter(
          (value): value is number =>
            typeof value === 'number' && Number.isFinite(value)
        );
      const average = mean(values);
      if (average !== undefined) {
        (merged as Record<string, unknown>)[key] = average;
      }
    }
    return merged;
  });
}
