import { describe, expect, it, vi } from 'vitest';

import {
  hasReportCompareQuery,
  hrefWithoutDisabledReportCompare,
  isReportCompareView,
  parseReportCompareIds,
  REPORT_COMPARE_IDS_PARAM,
  REPORT_PERIOD_MODE_MODULE,
  REPORT_PERIOD_MODE_PARAM,
  REPORT_PERIOD_MODE_TERM,
  REPORT_PERIOD_MODE_VALUES,
  REPORT_VIEW_COMPARE,
  REPORT_VIEW_LIST,
  REPORT_VIEW_PARAM,
  serializeReportCompareIds,
} from './report-compare-url';

vi.mock('@/features/karvita/reports/constants', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/features/karvita/reports/constants')>();
  return {
    ...actual,
    REPORT_COMPARE_ENABLED: false,
  };
});

describe('report-compare-url', () => {
  it('exposes the view query key and compare token', () => {
    expect(REPORT_VIEW_PARAM).toBe('view');
    expect(REPORT_VIEW_COMPARE).toBe('compare');
    expect(REPORT_VIEW_LIST).toBe('list');
    expect(REPORT_COMPARE_IDS_PARAM).toBe('cmp');
    expect(REPORT_PERIOD_MODE_PARAM).toBe('tab');
    expect(REPORT_PERIOD_MODE_VALUES).toEqual([
      REPORT_PERIOD_MODE_TERM,
      REPORT_PERIOD_MODE_MODULE,
    ]);
  });

  it('detects compare view from the query value', () => {
    expect(isReportCompareView('compare')).toBe(true);
    expect(isReportCompareView('list')).toBe(false);
    expect(isReportCompareView(null)).toBe(false);
    expect(isReportCompareView(undefined)).toBe(false);
  });

  it('parses and serializes compare ids', () => {
    expect(parseReportCompareIds('a,b,a,c', 4)).toEqual(['a', 'b', 'c']);
    expect(parseReportCompareIds('a,b,c,d,e', 4)).toEqual(['a', 'b', 'c', 'd']);
    expect(parseReportCompareIds('  ', 4)).toEqual([]);
    expect(parseReportCompareIds(null, 4)).toEqual([]);
    expect(serializeReportCompareIds(['a', 'b', 'a'])).toBe('a,b');
    expect(serializeReportCompareIds([])).toBeNull();
  });

  it('detects compare query tokens', () => {
    expect(
      hasReportCompareQuery(new URLSearchParams('view=compare'))
    ).toBe(true);
    expect(hasReportCompareQuery(new URLSearchParams('cmp=a,b'))).toBe(true);
    expect(hasReportCompareQuery(new URLSearchParams('tab=term'))).toBe(false);
  });

  it('strips disabled compare query back to the list report url', () => {
    expect(
      hrefWithoutDisabledReportCompare(
        '/karvita/admin/reports/attendance',
        'view=compare&cmp=a,b&tab=term'
      )
    ).toBe('/karvita/admin/reports/attendance?tab=term');
    expect(
      hrefWithoutDisabledReportCompare(
        '/karvita/admin/reports/attendance',
        'view=compare'
      )
    ).toBe('/karvita/admin/reports/attendance');
    expect(
      hrefWithoutDisabledReportCompare(
        '/karvita/admin/reports/attendance',
        'tab=term'
      )
    ).toBeNull();
  });
});
