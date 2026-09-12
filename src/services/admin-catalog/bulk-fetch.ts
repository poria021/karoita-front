import type {
  NestAdminPageQuery,
  NestCity,
  NestDegree,
  NestDegreeListQuery,
  NestEducationalDistrict,
  NestEducationListQuery,
  NestPagedList,
  NestProvinceLite,
  NestSchool,
  NestSchoolListQuery,
  NestUniversity,
  NestUniversityListQuery,
} from '@/types/nest-admin';

import { degreeRoleApi } from './resources/degree-role.api';
import { educationSchoolApi } from './resources/education-school.api';
import { provinceCityApi } from './resources/province-city.api';
import { universityApi } from './resources/university.api';

const NEST_PAGED_CATALOG_PAGE_SIZE = 200;
// اگر `hasNextPage` هیچ‌وقت false نشود حلقه قطع شود.
const NEST_PAGED_CATALOG_MAX_PAGES = 50;

async function fetchAllNestPagedCatalog<T>(
  listPage: (
    query: NestAdminPageQuery,
    token?: string
  ) => Promise<NestPagedList<T>>,
  token?: string
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  for (let i = 0; i < NEST_PAGED_CATALOG_MAX_PAGES; i += 1) {
    const { data, hasNextPage } = await listPage(
      { page, limit: NEST_PAGED_CATALOG_PAGE_SIZE },
      token
    );
    all.push(...data);
    if (!hasNextPage) break;
    page += 1;
  }
  return all;
}

/**
 * همهٔ استان‌ها برای typeahead: اول GET /admin/province/all (بدون پاکت)، اگر خطا داد صفحات GET /admin/provinces.
 */
export async function fetchAllNestProvinces(
  token?: string
): Promise<NestProvinceLite[]> {
  try {
    return await provinceCityApi.getAllProvinces(undefined, token);
  } catch {
    return fetchAllNestPagedCatalog(provinceCityApi.listProvinces, token);
  }
}

/**
 * همهٔ شهرها: GET /admin/cities صفحه‌بندی دارد و bulk مثل `/admin/province/all` ندارد — صفحهٔ ۱ برای قفل حذف کافی نیست.
 */
export async function fetchAllNestCities(token?: string): Promise<NestCity[]> {
  return fetchAllNestPagedCatalog(provinceCityApi.listCities, token);
}

export async function fetchAllNestEducations(
  query: Omit<NestEducationListQuery, 'page' | 'limit'> = {},
  token?: string
): Promise<NestEducationalDistrict[]> {
  return fetchAllNestPagedCatalog(
    (pageQuery, pageToken) =>
      educationSchoolApi.listEducations({ ...query, ...pageQuery }, pageToken),
    token
  );
}

export async function fetchAllNestSchools(
  query: Omit<NestSchoolListQuery, 'page' | 'limit'> = {},
  token?: string
): Promise<NestSchool[]> {
  return fetchAllNestPagedCatalog(
    (pageQuery, pageToken) =>
      educationSchoolApi.listSchools({ ...query, ...pageQuery }, pageToken),
    token
  );
}

export async function fetchAllNestUniversities(
  query: Omit<NestUniversityListQuery, 'page' | 'limit'> = {},
  token?: string
): Promise<NestUniversity[]> {
  return fetchAllNestPagedCatalog(
    (pageQuery, pageToken) =>
      universityApi.listUniversities({ ...query, ...pageQuery }, pageToken),
    token
  );
}

export async function fetchAllNestDegrees(
  query: Omit<NestDegreeListQuery, 'page' | 'limit'> = {},
  token?: string
): Promise<NestDegree[]> {
  return fetchAllNestPagedCatalog(
    (pageQuery, pageToken) =>
      degreeRoleApi.listDegrees({ ...query, ...pageQuery }, pageToken),
    token
  );
}
