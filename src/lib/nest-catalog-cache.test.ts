import { describe, expect, it } from 'vitest';

import { isMutationCacheRelated } from '@/lib/nest-catalog-cache';

describe('isMutationCacheRelated', () => {
  it('flags exact-path mutations (create) as cache-related', () => {
    expect(isMutationCacheRelated('admin/educations')).toBe(true);
    expect(isMutationCacheRelated('admin/schools')).toBe(true);
  });

  it('flags single-entity update/delete paths as cache-related via cascade', () => {
    expect(isMutationCacheRelated('admin/provinces/507f1f77bcf86cd799439011')).toBe(true);
    expect(isMutationCacheRelated('admin/cities/507f1f77bcf86cd799439011')).toBe(true);
    expect(isMutationCacheRelated('admin/educations/507f1f77bcf86cd799439011')).toBe(true);
    expect(isMutationCacheRelated('admin/universites/507f1f77bcf86cd799439011')).toBe(true);
    expect(isMutationCacheRelated('admin/degree/507f1f77bcf86cd799439011')).toBe(true);
  });

  it('flags school delete (no slash before id) and school update (with slash)', () => {
    expect(isMutationCacheRelated('admin/schools507f1f77bcf86cd799439011')).toBe(true);
    expect(isMutationCacheRelated('admin/schools/507f1f77bcf86cd799439011')).toBe(true);
  });

  it('does not flag unrelated paths', () => {
    expect(isMutationCacheRelated('admin/professor-capacities')).toBe(false);
    expect(isMutationCacheRelated('v1/some/other/path')).toBe(false);
  });
});
