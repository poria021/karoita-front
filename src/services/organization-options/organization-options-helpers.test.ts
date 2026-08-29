import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildOrganizationOptionsRequest } from '@/services/organization-options.service';
import {
  dedupeOptions,
  fetchOrganizationOptionsFromApi,
  invalidateCityNameCache,
  invalidateDistrictNameCache,
  invalidateProvinceNameCache,
  paginateBare,
  toNameList,
} from '@/services/organization-options/organization-options-helpers';

const listProvinces = vi.fn();
const listCitiesByProvince = vi.fn();
const listCities = vi.fn();
const listEducationsByCity = vi.fn();
const listEducationsByProvince = vi.fn();
const listEducations = vi.fn();
const listDegrees = vi.fn();
const fetchAllNestProvinces = vi.fn();

vi.mock('@/services/admin-catalog/admin-catalog.api', () => ({
  adminCatalogApi: {
    listProvinces: (...args: unknown[]) => listProvinces(...args),
    listCitiesByProvince: (...args: unknown[]) => listCitiesByProvince(...args),
    listCities: (...args: unknown[]) => listCities(...args),
    listEducationsByCity: (...args: unknown[]) => listEducationsByCity(...args),
    listEducationsByProvince: (...args: unknown[]) =>
      listEducationsByProvince(...args),
    listEducations: (...args: unknown[]) => listEducations(...args),
    listDegrees: (...args: unknown[]) => listDegrees(...args),
  },
  fetchAllNestProvinces: (...args: unknown[]) => fetchAllNestProvinces(...args),
  fetchAllNestEducations: vi.fn(),
  fetchAllNestSchools: vi.fn(),
}));

describe('organization options — Nest typeahead', () => {
  beforeEach(() => {
    listProvinces.mockReset();
    listCitiesByProvince.mockReset();
    listCities.mockReset();
    listEducationsByCity.mockReset();
    listEducationsByProvince.mockReset();
    listEducations.mockReset();
    listDegrees.mockReset();
    fetchAllNestProvinces.mockReset();
    invalidateProvinceNameCache();
    invalidateDistrictNameCache();
    invalidateCityNameCache();
  });

  it('keeps city on the request that hits Nest', () => {
    const request = buildOrganizationOptionsRequest({
      type: 'district',
      province: 'تهران',
      city: 'ری',
      page: 2,
    });
    expect(request.city).toBe('ری');
    expect(request.province).toBe('تهران');
    expect(request.page).toBe(2);
    expect(request.limit).toBe(10);
  });

  it('normalizes name lists and paginates bare Nest arrays', () => {
    expect(toNameList('تهران')).toEqual(['تهران']);
    expect(toNameList(['تهران', ''])).toEqual(['تهران']);
    expect(
      paginateBare(
        [
          { id: '1', label: 'الف' },
          { id: '2', label: 'ب' },
          { id: '3', label: 'ج' },
        ],
        2,
        2
      )
    ).toEqual({
      items: [{ id: '3', label: 'ج' }],
      hasMore: false,
      page: 2,
    });
    expect(
      dedupeOptions([
        { id: '1', label: 'الف' },
        { id: '1', label: 'الف-دوباره' },
      ])
    ).toEqual([{ id: '1', label: 'الف' }]);
  });

  it('lists provinces from the Nest envelope', async () => {
    listProvinces.mockResolvedValue({
      data: [{ id: 'p1', title: 'تهران' }],
      hasNextPage: false,
    });

    const result = await fetchOrganizationOptionsFromApi({
      type: 'province',
      page: 1,
      limit: 10,
      query: 'تهر',
    });

    expect(listProvinces).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      filters: 'تهر',
    });
    expect(result.items).toEqual([{ id: 'p1', label: 'تهران' }]);
  });

  it('scopes cities by resolved province id', async () => {
    fetchAllNestProvinces.mockResolvedValue([{ id: 'p1', title: 'تهران' }]);
    listCitiesByProvince.mockResolvedValue([{ id: 'c1', title: 'ری' }]);

    const result = await fetchOrganizationOptionsFromApi({
      type: 'city',
      page: 1,
      limit: 10,
      province: 'تهران',
    });

    expect(listCitiesByProvince).toHaveBeenCalledWith('p1');
    expect(listCities).not.toHaveBeenCalled();
    expect(result.items).toEqual([{ id: 'c1', label: 'ری' }]);
  });

  it('scopes districts by city id when city is present (Nest city→educations)', async () => {
    fetchAllNestProvinces.mockResolvedValue([{ id: 'p1', title: 'تهران' }]);
    listCitiesByProvince.mockResolvedValue([{ id: 'c1', title: 'ری' }]);
    listEducationsByCity.mockResolvedValue([{ id: 'd1', title: 'منطقه ۱' }]);

    const result = await fetchOrganizationOptionsFromApi({
      type: 'district',
      page: 1,
      limit: 10,
      province: 'تهران',
      city: 'ری',
    });

    expect(listEducationsByCity).toHaveBeenCalledWith('c1');
    expect(listEducationsByProvince).not.toHaveBeenCalled();
    expect(result.items).toEqual([{ id: 'd1', label: 'منطقه ۱' }]);
  });

  it('lists majors from the Nest degreeee envelope', async () => {
    listDegrees.mockResolvedValue({
      data: [
        {
          id: '6a8fae999dd4b76b91bbd789',
          title: 'مهندسی معدن',
          role: { id: '6a895cc8864f70463b97c17e', title: 'teacher' },
        },
      ],
      hasNextPage: false,
    });

    const result = await fetchOrganizationOptionsFromApi({
      type: 'major',
      page: 1,
      limit: 10,
      query: 'معدن',
    });

    expect(listDegrees).toHaveBeenCalledWith({
      title: 'معدن',
      page: 1,
      limit: 10,
    });
    expect(result.items).toEqual([
      { id: '6a8fae999dd4b76b91bbd789', label: 'مهندسی معدن' },
    ]);
    expect(result.hasMore).toBe(false);
  });
});
