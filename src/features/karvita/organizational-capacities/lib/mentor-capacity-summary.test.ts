import { describe, expect, it } from 'vitest';

import { mentorCapacityToSummary } from './mentor-capacity-summary';

describe('mentorCapacityToSummary', () => {
  it('maps the API fields to the three cards', () => {
    expect(
      mentorCapacityToSummary({
        semesterId: 's1',
        allTeacherCapacity: 27,
        selected: 0,
        remain: 27,
      })
    ).toEqual({ total: 27, confirmed: 0, remaining: 27 });
  });

  it('derives remaining when the API omits it', () => {
    expect(
      mentorCapacityToSummary({ allTeacherCapacity: 10, selected: 4 })
    ).toEqual({ total: 10, confirmed: 4, remaining: 6 });
  });

  it('returns null without a numeric total so the UI can fall back', () => {
    expect(mentorCapacityToSummary({})).toBeNull();
    expect(mentorCapacityToSummary(null)).toBeNull();
    expect(mentorCapacityToSummary({ allTeacherCapacity: Number.NaN })).toBeNull();
  });
});
