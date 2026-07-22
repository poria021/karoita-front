import { describe, expect, it } from 'vitest';

import {
  formatJalaliDate,
  formatJalaliSlashDisplay,
  formatNotificationTime,
} from '@/utils/formatJalaliDate';

describe('formatJalaliDate', () => {
  it('orders weekday, day, month, year for RTL display', () => {
    const formatted = formatJalaliDate(new Date('2026-07-22T12:00:00+03:30'));
    const parts = formatted.split(/\s+/);

    expect(parts.length).toBe(4);
    expect(parts[0]).toMatch(
      /شنبه|یکشنبه|دوشنبه|سه‌شنبه|سه\u200cشنبه|چهارشنبه|پنجشنبه|پنج\u200cشنبه|جمعه/
    );
    expect(parts[1]).toMatch(/^[۰-۹]+$/);
    expect(parts[2]).toMatch(/^[^\d۰-۹]+$/);
    expect(parts[3]).toMatch(/^[۰-۹]+$/);
  });
});

describe('formatNotificationTime', () => {
  const now = new Date('2026-07-22T12:00:00+03:30');

  it('uses relative Persian phrases within one week', () => {
    expect(
      formatNotificationTime(new Date(now.getTime() - 30 * 1000), now)
    ).toBe('چند لحظه قبل');
    expect(
      formatNotificationTime(new Date(now.getTime() - 5 * 60 * 1000), now)
    ).toBe('۵ دقیقه قبل');
    expect(
      formatNotificationTime(new Date(now.getTime() - 2 * 60 * 60 * 1000), now)
    ).toBe('۲ ساعت قبل');
    expect(
      formatNotificationTime(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), now)
    ).toBe('۳ روز قبل');
  });

  it('uses jalali slash after one week', () => {
    const older = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    expect(formatNotificationTime(older, now)).toBe(
      formatJalaliSlashDisplay(older)
    );
    expect(formatNotificationTime(older, now)).toMatch(/^[۰-۹]+\/[۰-۹]+\/[۰-۹]+$/);
  });
});
