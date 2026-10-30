import { describe, expect, it } from 'vitest';

import {
  reportIdsForRole,
  reportsForRole,
  resolveReportLabel,
} from './reportsAccess';
import { getReportDefinition } from './reportsAccess';

describe('reportsAccess Word alignment', () => {
  it('lists supervisor reports in Word order with exact labels', () => {
    const views = reportsForRole('supervisor_professor');
    expect(views.map((v) => v.label)).toEqual([
      'لیست نمرات و ارزیابی‌ پایانی',
      'گزارش بازخوردهای فعالیت‌های انجام‌شده',
      'لیست فعالیت‌های بارگذاری شده توسط دانشجو',
      'گزارش تاخیر ثبت فعالیت دانشجویان در بازه زمانی تعیین‌شده',
      'گزارش کارنامه فردی',
      'لیست کارورزان به تفکیک استان، شهر منطقه، مدرسه و معلم راهنما',
      'لیست تعداد روزهای حضوریا عدم حضور دانشجو در مدرسه تایید شده توسط مدیر',
      'لیست معلمان به تفکیک استان، شهر منطقه، مدرسه و کارورز',
      'لیست مدیران به تفکیک استان، شهر منطقه، مدرسه، کارورز و معلم راهنما',
    ]);
  });

  it('gives school_principal the three Word standard reports', () => {
    expect(reportIdsForRole('school_principal')).toEqual([
      'trainee_list',
      'mentor_feedback_performance',
      'attendance_days',
    ]);
  });

  it('resolves central organization trainee list label from catalog', () => {
    const report = getReportDefinition('trainee_list')!;
    expect(resolveReportLabel(report, 'central_organization')).toBe(
      'لیست کارورزان تفکیک استان، شهر/منطقه، مدرسه، دوره تحصیلی، استاد راهنما، مدیر مدرسه، معلم راهنما'
    );
  });

  it('gives super_admin the full Word union including governance extras', () => {
    expect(reportIdsForRole('super_admin').length).toBeGreaterThanOrEqual(23);
    expect(reportIdsForRole('assistant_admin')).toEqual(
      reportIdsForRole('super_admin')
    );
  });
});
