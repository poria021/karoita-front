import { describe, expect, it, vi } from 'vitest';

vi.mock('@/services/api-client', async () => {
  const { ApiClientError } = await import('@/services/api-error');
  return {
    ApiClientError,
    apiClient: { getJson: vi.fn(), baseUrl: 'http://localhost/api/nest' },
  };
});

import { mapLearnerRow } from '@/services/reports/real/learners-report.api';
import { getColumnDefs } from '@/services/reports/real/report-columns';

describe('ستون شماره دانشجویی / کد مهارت‌آموزی در لیست فراگیران', () => {
  it('شناسه را از چند نام محتمل می‌خواند', () => {
    expect(
      mapLearnerRow({ id: 'a', fullName: 'سارا', userUniqueId: '140212345' }, 0)
    ).toMatchObject({ studentNumber: '140212345' });
    expect(
      mapLearnerRow({ id: 'b', fullName: 'علی', studentNumber: 99887 }, 0)
    ).toMatchObject({ studentNumber: '99887' });
    expect(
      mapLearnerRow({ id: 'c', fullName: 'نیما', skillCode: '99412' }, 0)
    ).toMatchObject({ studentNumber: '99412' });
  });

  it('اگر API نفرستد خالی می‌ماند', () => {
    expect(
      mapLearnerRow({ id: 'd', fullName: 'رضا' }, 0)?.studentNumber
    ).toBeUndefined();
  });

  it('در لیست فراگیران و عملکرد فراگیران ستون شماره دانشجویی نیست', () => {
    for (const slug of ['learners', 'scores'] as const) {
      for (const mode of ['term', 'module'] as const) {
        const columns = getColumnDefs(slug, mode);
        expect(columns.some((col) => col.id === 'studentNumber')).toBe(false);
      }
    }
    // لیست فراگیران: تلفن زیر نام.
    expect(getColumnDefs('learners')[0]).toMatchObject({
      kind: 'two-line',
      secondaryKey: 'phone',
    });
  });

  it('عملکرد فراگیران: بدون تلفن زیر نام و بدون رشته زیر دانشکده', () => {
    const columns = getColumnDefs('scores');
    expect(columns[0]).toMatchObject({ id: 'name', kind: 'text' });
    expect(columns.some((col) => col.kind === 'phone')).toBe(false);
    expect(columns.some((col) => col.secondaryKey === 'major')).toBe(false);
    expect(columns.some((col) => col.id === 'status')).toBe(false);
  });
});
