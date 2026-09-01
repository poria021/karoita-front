import { isStaffAdminRole, toNestAdminAccountRole } from '@/services/auth/real/nest-auth-role';
import { isCreatableStaffAdminRole } from '@/types/role-taxonomy';
import type {
  CreateOrganizationalUserInput,
  UpdateStaffAdminInput,
} from '@/types/admin-user-creation';
import type { NestCreateAdminDto, NestUpdateAdminDto } from '@/types/nest-admins';

/** مثال PUT در Swagger `status: 2` است و ۲۰۰ `status.name: active`؛ غیرفعال اسلات عددی ۱. */
export const NEST_ADMIN_STATUS_ACTIVE = 2;
export const NEST_ADMIN_STATUS_INACTIVE = 1;

/** مثال CreateAdmin.phone در Swagger با صفر اول است (`0938…`)؛ فرانت ۱۰ رقم بدون پیشوند نگه می‌دارد. */
export function toNestAdminPhone(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('9')) return `0${digits}`;
  if (digits.length === 11 && digits.startsWith('09')) return digits;
  return digits;
}

/** ۱۰ رقم ملی (۹xxxxxxxxx) برای مقایسهٔ 09 / +98 / ۱۰ رقم خام. */
export function toComparableIranMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('98')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('09')) return digits.slice(1);
  if (digits.length === 10 && digits.startsWith('9')) return digits;
  return digits;
}

export function nestPhonesMatch(left: string, right: string): boolean {
  const a = toComparableIranMobile(left);
  const b = toComparableIranMobile(right);
  return a.length === 10 && a === b;
}

export function toNestCreateAdminDto(
  input: Pick<
    CreateOrganizationalUserInput,
    'firstName' | 'lastName' | 'mobile' | 'role'
  >
): NestCreateAdminDto {
  if (!isCreatableStaffAdminRole(input.role)) {
    throw new Error('این نقش از مسیر ایجاد ادمین پشتیبانی نمی‌شود.');
  }

  return {
    fname: input.firstName.trim(),
    lname: input.lastName.trim(),
    phone: toNestAdminPhone(input.mobile),
    role: toNestAdminAccountRole(input.role),
  };
}

export function toNestAdminStatusCode(active: boolean): number {
  return active ? NEST_ADMIN_STATUS_ACTIVE : NEST_ADMIN_STATUS_INACTIVE;
}

export function toNestUpdateAdminDto(
  input: UpdateStaffAdminInput
): NestUpdateAdminDto {
  if (!isStaffAdminRole(input.role)) {
    throw new Error('این نقش از مسیر ویرایش ادمین پشتیبانی نمی‌شود.');
  }

  return {
    fname: input.firstName.trim(),
    lname: input.lastName.trim(),
    phone: toNestAdminPhone(input.mobile),
    role: toNestAdminAccountRole(input.role),
    status: toNestAdminStatusCode(input.active),
  };
}
