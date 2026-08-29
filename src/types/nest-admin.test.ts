import { describe, expect, it } from 'vitest';

import { parseNestPagedList } from '@/types/nest-admin';

describe('parseNestPagedList', () => {
  it('reads the live { data, hasNextPage } envelope', () => {
    expect(
      parseNestPagedList({ data: [{ id: '1' }], hasNextPage: true })
    ).toEqual({ data: [{ id: '1' }], hasNextPage: true });
  });

  it('treats a legacy bare array as a single last page', () => {
    expect(parseNestPagedList([{ id: '1' }])).toEqual({
      data: [{ id: '1' }],
      hasNextPage: false,
    });
  });

  it('does not throw on empty payloads', () => {
    expect(parseNestPagedList(null)).toEqual({ data: [], hasNextPage: false });
  });
});
