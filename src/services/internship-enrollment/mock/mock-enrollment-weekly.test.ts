import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { buildWeeklySessions } from './mock-enrollment-weekly';
import {
  readSnapshot,
  writeSnapshot,
} from './mock-enrollment-persistence';

describe('buildWeeklySessions — sequential lock', () => {
  beforeEach(() => {
    writeSnapshot({ records: [], confirmedCapacity: {}, weekReports: {} });
  });

  afterEach(() => {
    writeSnapshot({ records: [], confirmedCapacity: {}, weekReports: {} });
  });

  it('keeps the first week open even when never submitted', () => {
    const weeks = buildWeeklySessions({
      kind: 'internship',
      level: 1,
      termId: 'term-1',
      userId: 'user-1',
    });

    expect(weeks[0]).toBeDefined();
    expect(weeks[0]!.status).toBe('graded'); // First week is seeded as 'graded' in mock
  });

  it('locks week 2 when week 1 is draft', () => {
    // Override week 1 to draft status (which is less advanced than 'approved' seeded value)
    const snapshot = readSnapshot();
    writeSnapshot({
      ...snapshot,
      weekReports: {
        'user-1:term-1:internship:1:week-1': {
          status: 'draft',
          text: '',
          files: [],
        },
        'user-1:term-1:internship:1:week-2': {
          status: 'draft',
          text: '',
          files: [],
        },
      },
    });

    const weeks = buildWeeklySessions({
      kind: 'internship',
      level: 1,
      termId: 'term-1',
      userId: 'user-1',
    });

    expect(weeks[1]).toBeDefined();
    expect(weeks[1]!.status).toBe('locked_future');
  });

  it('opens week 2 when week 1 is pending (submitted)', () => {
    const snapshot = readSnapshot();
    writeSnapshot({
      ...snapshot,
      weekReports: {
        'user-1:term-1:internship:1:week-1': {
          status: 'pending',
          text: 'submitted',
          files: [],
        },
      },
    });

    const weeks = buildWeeklySessions({
      kind: 'internship',
      level: 1,
      termId: 'term-1',
      userId: 'user-1',
    });

    expect(weeks[1]).toBeDefined();
    expect(weeks[1]!.status).toBe('approved'); // Week 2 is seeded as 'approved'
  });

  it('propagates the lock forward through consecutive unsent weeks', () => {
    const snapshot = readSnapshot();
    writeSnapshot({
      ...snapshot,
      weekReports: {
        'user-1:term-1:internship:1:week-1': {
          status: 'pending',
          text: 'submitted',
          files: [],
        },
        'user-1:term-1:internship:1:week-2': {
          status: 'draft',
          text: '',
          files: [],
        },
        'user-1:term-1:internship:1:week-3': {
          status: 'draft',
          text: '',
          files: [],
        },
      },
    });

    const weeks = buildWeeklySessions({
      kind: 'internship',
      level: 1,
      termId: 'term-1',
      userId: 'user-1',
    });

    expect(weeks[1]!.status).toBe('draft'); // Week 2 is overridden to draft
    expect(weeks[2]!.status).toBe('locked_future'); // Week 3 is locked because week 2 is draft
  });
});
