import { describe, expect, it } from 'vitest';

import { getReportCompareSpec } from '../catalog/compareSpecs';
import {
  buildEntitySeries,
  listEntityPool,
  parseMetricNumber,
  stripHtml,
} from './compareMetrics';
import {
  comparableReportsForRole,
  resolveComparativeFilterKeys,
  resolveReportFilterKeys,
  getReportDefinition,
} from './reportsAccess';

describe('comparative vs standard filters', () => {
  it('keeps comparative filters distinct from standard for final_grades', () => {
    const report = getReportDefinition('final_grades')!;
    const standard = resolveReportFilterKeys(report, 'supervisor_professor');
    const comparative = resolveComparativeFilterKeys(
      report,
      'supervisor_professor'
    );
    expect(standard).toEqual([
      'termId',
      'courseId',
      'minScore',
      'maxScore',
      'traineeId',
    ]);
    expect(comparative).toEqual(['termId', 'courseId']);
    expect(comparative).not.toContain('traineeId');
    expect(comparative).not.toContain('minScore');
  });

  it('compares final_grades by trainee scores not schools', () => {
    const spec = getReportCompareSpec('final_grades')!;
    expect(spec.entityKey).toBe('traineeName');
    expect(spec.entityLabel).toBe('کارورز');
    expect(spec.metrics.map((m) => m.key)).toContain('total20');
  });

  it('compares active_schools_list by school performance metrics', () => {
    const spec = getReportCompareSpec('active_schools_list')!;
    expect(spec.entityKey).toBe('school');
    expect(spec.entityLabel).toBe('مدرسه');
    expect(spec.metrics.map((m) => m.key)).toEqual([
      'traineeCount',
      'mentorCount',
    ]);
  });

  it('limits comparable views to reports with compare specs', () => {
    const views = comparableReportsForRole('supervisor_professor');
    expect(views.every((v) => getReportCompareSpec(v.id))).toBe(true);
    expect(views.some((v) => v.id === 'trainee_transcript')).toBe(false);
  });
});

describe('compareMetrics helpers', () => {
  it('parses persian metric numbers and percent', () => {
    expect(parseMetricNumber('۱۸.۵')).toBe(18.5);
    expect(parseMetricNumber('۹۲٪')).toBe(92);
    expect(stripHtml('<b>امیرحسین</b>')).toBe('امیرحسین');
  });

  it('builds series for selected trainees from final_grades rows', () => {
    const report = getReportDefinition('final_grades')!;
    const pool = listEntityPool(report.rows, 'traineeName');
    expect(pool.length).toBeGreaterThanOrEqual(2);
    const series = buildEntitySeries(
      report.rows,
      'traineeName',
      getReportCompareSpec('final_grades')!.metrics,
      pool.slice(0, 2)
    );
    expect(series).toHaveLength(2);
    expect(series[0]!.values.total20).not.toBeNull();
  });
});
