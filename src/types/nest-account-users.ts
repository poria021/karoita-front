/**
 * DTO حساب سازمانی Nest — POST/GET/PATCH/DELETE `/api/v1/admin/account-users`.
 * ثبت دستی با fname/lname/phone/password/role الزامی؛ province/city/educationDistrict اختیاری‌اند.
 * `role` بدنهٔ نوشتن باید شناسهٔ نقش باشد؛ آن را از GET `/account-users/roles` بگیر.
 */
import type { NestPagedList } from '@/types/nest-admin';

export type NestAccountUserRoleDto = {
  id: string;
  name: string;
  is_other_role?: boolean;
};

export type NestAccountUserStatusDto = {
  id: string;
  name: string;
};

export type NestAccountUserTitleRef = {
  id: string;
  title: string;
};

export type NestAccountUserDto = {
  id: string;
  phone: string;
  provider?: string;
  socialId?: string;
  firstName: string;
  lastName: string;
  role: NestAccountUserRoleDto;
  status?: NestAccountUserStatusDto;
  userUniqueId?: string;
  city?: NestAccountUserTitleRef[] | null;
  educationalDistrict?: NestAccountUserTitleRef[] | null;
  school?: NestAccountUserTitleRef[] | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

/** بدنهٔ POST /api/v1/admin/account-users. */
export type NestCreateAccountUserDto = {
  fname: string;
  lname: string;
  phone: string;
  password: string;
  role: string;
  province?: string;
  city?: string;
  educationDistrict?: string;
};

/** بدنهٔ PATCH /api/v1/admin/account-users/{id} — همان شکل create، همه اختیاری. */
export type NestUpdateAccountUserDto = Partial<NestCreateAccountUserDto>;

export type NestAccountUsersListQuery = {
  page?: number;
  limit?: number;
  role?: string;
};

export type NestAccountUsersListResponse = NestPagedList<NestAccountUserDto>;
