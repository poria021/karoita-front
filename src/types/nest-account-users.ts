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

/** لایو معمولاً فقط `id` می‌دهد؛ `name` را ندیدیم — اختیاری نگه داشتیم. */
export type NestAccountUserStatusDto = {
  id: string;
  name?: string;
};

/** `city`/`educationalDistrict`/`school` از `id` استفاده می‌کنند؛ `province`/`university` از `_id` (رفتار لایو، تست‌شده). */
export type NestAccountUserTitleRef = {
  id?: string;
  _id?: string;
  title: string;
};

/**
 * پاسخ POST/GET/PATCH `/api/v1/admin/account-users` — روی محیط لایو تست شد
 * (۱۱ سپتامبر ۲۰۲۶). `province`/`university`/`degree`/`documentStatus` در
 * پاسخ واقعی هستند ولی قبلاً در تایپ نبودند.
 */
export type NestAccountUserDto = {
  id: string;
  phone: string;
  provider?: string;
  socialId?: string | null;
  firstName?: string;
  lastName?: string;
  role: NestAccountUserRoleDto;
  status?: NestAccountUserStatusDto;
  userUniqueId?: string;
  city?: NestAccountUserTitleRef[] | null;
  province?: NestAccountUserTitleRef[] | null;
  educationalDistrict?: NestAccountUserTitleRef[] | null;
  school?: NestAccountUserTitleRef[] | null;
  university?: NestAccountUserTitleRef[] | null;
  degree?: NestAccountUserTitleRef | null;
  /**
   * لایو این مقدار را با کیس متفاوت از enum کاربران عمومی برمی‌گرداند
   * (مثلاً `"notInit"` نه `"NOTINIT"`) — قبل از مصرف با `.toUpperCase()` نرمال کن.
   */
  documentStatus?: string;
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
