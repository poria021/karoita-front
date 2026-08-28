/**
 * Nest Admin-account DTOs from
 * https://backenddev.darkube.ir/docs — POST/GET/PUT `/api/v1/admin/admins`.
 *
 * Domain `User` stays FE-shaped; mappers convert at the facade.
 */
import type { NestPagedList } from '@/types/nest-admin';

/** Swagger CreateAdmin / update `role` — not the Auth RoleDto.name union. */
export type NestAdminAccountRoleName = 'admin' | 'superadmin';

export type NestAdminStatus = {
  id: string;
  name: string;
};

export type NestAdminDto = {
  id: string;
  fname: string;
  lname: string;
  phone: string;
  status: NestAdminStatus;
  role: NestAdminAccountRoleName | string;
  createdAt: string;
  updatedAt: string;
};

/** POST /api/v1/admin/admins */
export type NestCreateAdminDto = {
  fname: string;
  lname: string;
  phone: string;
  role: NestAdminAccountRoleName;
};

/** PUT /api/v1/admin/admins/{id} */
export type NestUpdateAdminDto = {
  fname?: string;
  lname?: string;
  phone?: string;
  role?: NestAdminAccountRoleName;
  status?: number;
};

export type NestAdminsListQuery = {
  page?: number;
  limit?: number;
};

export type NestAdminsListResponse = NestPagedList<NestAdminDto>;
