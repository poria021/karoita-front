import { beforeEach, describe, expect, it } from 'vitest';

import {
  _clearCatalogCache,
  getCatalogCache,
  invalidateCatalogCacheByPath,
  isMutationCacheRelated,
  setCatalogCache,
} from '@/lib/nest-catalog-cache';

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

describe('invalidateCatalogCacheByPath — bare create paths (no id)', () => {
  beforeEach(() => {
    _clearCatalogCache();
  });

  function seed(path: string) {
    setCatalogCache(path, { body: '[]', contentType: 'application/json', status: 200, ttlMs: 60_000 });
  }

  it('creating a term (POST admin/semester) also busts semesters_all', () => {
    seed('admin/semester');
    seed('admin/semesters_all?structure=semester');
    invalidateCatalogCacheByPath('admin/semester');
    expect(getCatalogCache('admin/semester')).toBeNull();
    expect(getCatalogCache('admin/semesters_all?structure=semester')).toBeNull();
  });

  it('creating a province (POST admin/provinces) also busts admin/province/all', () => {
    seed('admin/provinces');
    seed('admin/province/all');
    invalidateCatalogCacheByPath('admin/provinces');
    expect(getCatalogCache('admin/provinces')).toBeNull();
    expect(getCatalogCache('admin/province/all')).toBeNull();
  });

  it('creating a school (POST admin/schools) also busts admin/schools/all', () => {
    seed('admin/schools');
    seed('admin/schools/all');
    invalidateCatalogCacheByPath('admin/schools');
    expect(getCatalogCache('admin/schools')).toBeNull();
    expect(getCatalogCache('admin/schools/all')).toBeNull();
  });

  it('creating a degree (POST admin/degree) also busts the mismatched admin/degreeee list', () => {
    seed('admin/degreeee');
    invalidateCatalogCacheByPath('admin/degree');
    expect(getCatalogCache('admin/degreeee')).toBeNull();
  });

  it('creating a week (POST admin/weeks) also busts semesters_all', () => {
    seed('admin/semesters_all?structure=semester');
    invalidateCatalogCacheByPath('admin/weeks');
    expect(getCatalogCache('admin/semesters_all?structure=semester')).toBeNull();
  });
});
