import { describe, expect, it } from 'vitest';

import { buildOrgStructureSeed } from '@/services/mock/org-structure-seed';
import { DEFAULT_PAGE_LIMIT } from '@/utils/offset-limit-page';

describe('org structure mock seed paging capacity', () => {
  it('has more than one admin page of rows for every list tab', () => {
    const seed = buildOrgStructureSeed();
    expect(seed.provinces.length).toBeGreaterThan(DEFAULT_PAGE_LIMIT);
    expect(seed.cities.length).toBeGreaterThan(DEFAULT_PAGE_LIMIT);
    expect(seed.faculties.length).toBeGreaterThan(DEFAULT_PAGE_LIMIT);
    expect(seed.districts.length).toBeGreaterThan(DEFAULT_PAGE_LIMIT);
    expect(seed.schools.length).toBeGreaterThan(DEFAULT_PAGE_LIMIT);
    expect(seed.majors.length).toBeGreaterThan(DEFAULT_PAGE_LIMIT);
  });
});
