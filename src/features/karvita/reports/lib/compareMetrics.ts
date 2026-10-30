import { persianToEnglishDigits } from '@/utils/persianDigits';

import type { ReportRow } from '../catalog/types';
import type { CompareMetricDef } from '../catalog/compareSpecs';

export function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '').trim();
}

/** استخراج عدد قابل‌مقایسه از سلول (فارسی/٪/متن). */
export function parseMetricNumber(raw: string | undefined): number | null {
  if (raw == null || raw === '') return null;
  const cleaned = persianToEnglishDigits(stripHtml(String(raw)))
    .replace(/[٪%]/g, '')
    .replace(/,/g, '')
    .trim();
  const match = cleaned.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : null;
}

export type CompareEntitySeries = {
  id: string;
  label: string;
  row: ReportRow;
  values: Record<string, number | null>;
  display: Record<string, string>;
};

export function buildEntitySeries(
  rows: ReportRow[],
  entityKey: string,
  metrics: readonly CompareMetricDef[],
  selectedIds: readonly string[]
): CompareEntitySeries[] {
  const byId = new Map<string, ReportRow>();
  for (const row of rows) {
    const raw = row[entityKey];
    if (raw == null) continue;
    const id = stripHtml(raw);
    if (!id || byId.has(id)) continue;
    byId.set(id, row);
  }

  return selectedIds
    .map((id) => {
      const row = byId.get(id);
      if (!row) return null;
      const values: Record<string, number | null> = {};
      const display: Record<string, string> = {};
      for (const m of metrics) {
        const cell = row[m.key] ?? '—';
        display[m.key] = stripHtml(cell);
        values[m.key] = parseMetricNumber(cell);
      }
      return { id, label: id, row, values, display };
    })
    .filter(Boolean) as CompareEntitySeries[];
}

export function listEntityPool(
  rows: ReportRow[],
  entityKey: string
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const row of rows) {
    const raw = row[entityKey];
    if (raw == null) continue;
    const id = stripHtml(raw);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

export function metricMax(
  series: CompareEntitySeries[],
  metricKey: string
): number {
  let max = 0;
  for (const s of series) {
    const v = s.values[metricKey];
    if (v != null && v > max) max = v;
  }
  return max > 0 ? max : 1;
}
