import { requireNestTransport } from '@/services/require-nest-transport';
import { adminCatalogApi } from '@/services/admin-catalog/admin-catalog.api';
import type {
  NestAdminPageQuery,
  NestCreateCityDto,
  NestCreateDegreeDto,
  NestCreateEducationalDistrictDto,
  NestCreateProvinceDto,
  NestCreateSchoolDto,
  NestCreateUniversityDto,
  NestEducationListQuery,
  NestSchoolListQuery,
  NestUpdateCityDto,
  NestUpdateDegreeDto,
  NestUpdateEducationalDistrictDto,
  NestUpdateProvinceDto,
  NestUpdateSchoolDto,
  NestUpdateUniversityDto,
} from '@/types/nest-admin';

/**
 * Nest Admin catalog facade — https://backenddev.darkube.ir/docs#/ Admin
 * Paths keep OpenAPI spellings (`universites`, `degreeee`).
 */
export const AdminCatalogService = {
  async createProvince(body: NestCreateProvinceDto, token?: string) {
    requireNestTransport('AdminCatalogService.createProvince');
    return adminCatalogApi.createProvince(body, token);
  },
  async listProvinces(query: NestAdminPageQuery = {}, token?: string) {
    requireNestTransport('AdminCatalogService.listProvinces');
    return adminCatalogApi.listProvinces(query, token);
  },
  async getAllProvinces(token?: string) {
    requireNestTransport('AdminCatalogService.getAllProvinces');
    return adminCatalogApi.getAllProvinces(token);
  },
  async updateProvince(id: string, body: NestUpdateProvinceDto, token?: string) {
    requireNestTransport('AdminCatalogService.updateProvince');
    return adminCatalogApi.updateProvince(id, body, token);
  },
  async deleteProvince(id: string, token?: string) {
    requireNestTransport('AdminCatalogService.deleteProvince');
    return adminCatalogApi.deleteProvince(id, token);
  },

  async createCity(body: NestCreateCityDto, token?: string) {
    requireNestTransport('AdminCatalogService.createCity');
    return adminCatalogApi.createCity(body, token);
  },
  async listCities(query: NestAdminPageQuery = {}, token?: string) {
    requireNestTransport('AdminCatalogService.listCities');
    return adminCatalogApi.listCities(query, token);
  },
  async getCity(id: string, token?: string) {
    requireNestTransport('AdminCatalogService.getCity');
    return adminCatalogApi.getCity(id, token);
  },
  async updateCity(id: string, body: NestUpdateCityDto, token?: string) {
    requireNestTransport('AdminCatalogService.updateCity');
    return adminCatalogApi.updateCity(id, body, token);
  },
  async deleteCity(id: string, token?: string) {
    requireNestTransport('AdminCatalogService.deleteCity');
    return adminCatalogApi.deleteCity(id, token);
  },
  async listCitiesByProvince(provinceId: string, token?: string) {
    requireNestTransport('AdminCatalogService.listCitiesByProvince');
    return adminCatalogApi.listCitiesByProvince(provinceId, token);
  },

  async createEducation(body: NestCreateEducationalDistrictDto, token?: string) {
    requireNestTransport('AdminCatalogService.createEducation');
    return adminCatalogApi.createEducation(body, token);
  },
  async listEducations(query: NestEducationListQuery = {}, token?: string) {
    requireNestTransport('AdminCatalogService.listEducations');
    return adminCatalogApi.listEducations(query, token);
  },
  async listEducationsByCity(cityId: string, token?: string) {
    requireNestTransport('AdminCatalogService.listEducationsByCity');
    return adminCatalogApi.listEducationsByCity(cityId, token);
  },
  async listEducationsByProvince(provinceId: string, token?: string) {
    requireNestTransport('AdminCatalogService.listEducationsByProvince');
    return adminCatalogApi.listEducationsByProvince(provinceId, token);
  },
  async updateEducation(
    id: string,
    body: NestUpdateEducationalDistrictDto,
    token?: string
  ) {
    requireNestTransport('AdminCatalogService.updateEducation');
    return adminCatalogApi.updateEducation(id, body, token);
  },
  async deleteEducation(id: string, token?: string) {
    requireNestTransport('AdminCatalogService.deleteEducation');
    return adminCatalogApi.deleteEducation(id, token);
  },

  async createSchool(body: NestCreateSchoolDto, token?: string) {
    requireNestTransport('AdminCatalogService.createSchool');
    return adminCatalogApi.createSchool(body, token);
  },
  async listSchools(query: NestSchoolListQuery = {}, token?: string) {
    requireNestTransport('AdminCatalogService.listSchools');
    return adminCatalogApi.listSchools(query, token);
  },
  async updateSchool(id: string, body: NestUpdateSchoolDto, token?: string) {
    requireNestTransport('AdminCatalogService.updateSchool');
    return adminCatalogApi.updateSchool(id, body, token);
  },
  async deleteSchool(id: string, token?: string) {
    requireNestTransport('AdminCatalogService.deleteSchool');
    return adminCatalogApi.deleteSchool(id, token);
  },

  async createDegree(body: NestCreateDegreeDto, token?: string) {
    requireNestTransport('AdminCatalogService.createDegree');
    return adminCatalogApi.createDegree(body, token);
  },
  /** GET /api/admin/degreeee (OpenAPI spelling). */
  async listDegrees(title?: string, token?: string) {
    requireNestTransport('AdminCatalogService.listDegrees');
    return adminCatalogApi.listDegrees(title, token);
  },
  async updateDegree(id: string, body: NestUpdateDegreeDto, token?: string) {
    requireNestTransport('AdminCatalogService.updateDegree');
    return adminCatalogApi.updateDegree(id, body, token);
  },
  async deleteDegree(id: string, token?: string) {
    requireNestTransport('AdminCatalogService.deleteDegree');
    return adminCatalogApi.deleteDegree(id, token);
  },

  async listRoles(token?: string) {
    requireNestTransport('AdminCatalogService.listRoles');
    return adminCatalogApi.listRoles(token);
  },
  async listDegreesByRole(roleId: string, token?: string) {
    requireNestTransport('AdminCatalogService.listDegreesByRole');
    return adminCatalogApi.listDegreesByRole(roleId, token);
  },

  async createUniversity(body: NestCreateUniversityDto, token?: string) {
    requireNestTransport('AdminCatalogService.createUniversity');
    return adminCatalogApi.createUniversity(body, token);
  },
  async listUniversities(title?: string, token?: string) {
    requireNestTransport('AdminCatalogService.listUniversities');
    return adminCatalogApi.listUniversities(title, token);
  },
  async updateUniversity(
    id: string,
    body: NestUpdateUniversityDto,
    token?: string
  ) {
    requireNestTransport('AdminCatalogService.updateUniversity');
    return adminCatalogApi.updateUniversity(id, body, token);
  },
  async deleteUniversity(id: string, token?: string) {
    requireNestTransport('AdminCatalogService.deleteUniversity');
    return adminCatalogApi.deleteUniversity(id, token);
  },
};
