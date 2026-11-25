import { describe, expect, it } from 'vitest';

import { pickDefaultTermId } from './pickDefaultTermId';

describe('pickDefaultTermId', () => {
  it('فهرست خالی → رشتهٔ خالی', () => {
    expect(pickDefaultTermId([], { newestLast: true })).toBe('');
  });

  it('real بدون پرچم ended (استاد) → آخرین ترم فهرست، نه قدیمی‌ترین', () => {
    const terms = [{ id: 'old' }, { id: 'mid' }, { id: 'new' }];
    expect(pickDefaultTermId(terms, { newestLast: true })).toBe('new');
  });

  it('mock → اولین ترم فهرست', () => {
    const terms = [{ id: 'a' }, { id: 'b' }];
    expect(pickDefaultTermId(terms, { newestLast: false })).toBe('a');
  });

  it('با پرچم ended → آخرین ترم باز', () => {
    const terms = [
      { id: 'old', ended: true },
      { id: 'open', ended: false },
      { id: 'closed', ended: true },
    ];
    expect(pickDefaultTermId(terms, { newestLast: true })).toBe('open');
  });

  it('همه ended → آخرین ترم فهرست', () => {
    const terms = [
      { id: 'a', ended: true },
      { id: 'b', ended: true },
    ];
    expect(pickDefaultTermId(terms, { newestLast: true })).toBe('b');
  });
});
