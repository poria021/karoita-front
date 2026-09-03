import { describe, expect, it } from 'vitest';

import { parseNestMaybePagedList, parseNestPagedList } from '@/types/nest-admin';

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

describe('parseNestMaybePagedList', () => {
  it('pages a bare GET /admin/schools array when limit is set', () => {
    const rows = [{ id: '1' }, { id: '2' }, { id: '3' }];
    expect(parseNestMaybePagedList(rows, 1, 2)).toEqual({
      data: [{ id: '1' }, { id: '2' }],
      hasNextPage: true,
    });
    expect(parseNestMaybePagedList(rows, 2, 2)).toEqual({
      data: [{ id: '3' }],
      hasNextPage: false,
    });
  });

  it('keeps the live envelope when Nest already pages the list', () => {
    expect(
      parseNestMaybePagedList(
        { data: [{ id: '1' }], hasNextPage: true },
        1,
        10
      )
    ).toEqual({ data: [{ id: '1' }], hasNextPage: true });
  });
});
