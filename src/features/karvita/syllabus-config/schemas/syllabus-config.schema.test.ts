import { describe, expect, it } from 'vitest';

import {
  professorCapacitySchema,
  passingThresholdSchema,
  termFormSchema,
  weekWeightSchema,
} from './syllabus-config.schema';

describe('syllabus-config schemas', () => {
  it('normalizes persian academic year digits', () => {
    const parsed = termFormSchema.safeParse({
      type: 'semester',
      titlePrefix: 'نیم‌سال اول',
      academicYear: '۱۴۰۵-۱۴۰۶',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.academicYear).toBe('1405-1406');
    }
  });

  it('rejects empty academic year', () => {
    const parsed = termFormSchema.safeParse({
      type: 'semester',
      titlePrefix: 'نیم‌سال اول',
      academicYear: '',
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe('سال تحصیلی الزامی است.');
    }
  });

  it('parses capacity and threshold with persian digits', () => {
    expect(
      professorCapacitySchema.safeParse({ capacity: '۱۵' }).success
    ).toBe(true);
    expect(
      professorCapacitySchema.safeParse({ capacity: '۱۵' }).data?.capacity
    ).toBe(15);
    expect(
      passingThresholdSchema.safeParse({ threshold: '۷۰' }).data?.threshold
    ).toBe(70);
    expect(
      passingThresholdSchema.safeParse({ threshold: '101' }).success
    ).toBe(false);
  });

  it('validates week weight', () => {
    expect(weekWeightSchema.safeParse(3).success).toBe(true);
    expect(weekWeightSchema.safeParse(0).success).toBe(false);
  });
});
