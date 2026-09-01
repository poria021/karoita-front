/**
 * DTO حساب ادمین Nest — POST/GET/PUT `/api/v1/admin/admins`.
 * دامنهٔ `User` شکل فرانت می‌ماند؛ mapper در facade تبدیل می‌کند.
 */
import type { NestPagedList } from '@/types/nest-admin';

/** نقش CreateAdmin در Swagger — نه unionِ Auth `RoleDto.name`. */
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

/** بدنهٔ POST /api/v1/admin/admins. */
export type NestCreateAdminDto = {
  fname: string;
  lname: string;
  phone: string;
  role: NestAdminAccountRoleName;
};

/** بدنهٔ PUT /api/v1/admin/admins/{id}. */
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
