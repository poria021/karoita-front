import { isStaffAdminRole, toNestAdminAccountRole } from '@/services/auth/real/nest-auth-role';
import type { CreateOrganizationalUserInput } from '@/types/admin-user-creation';
import type { NestCreateAdminDto } from '@/types/nest-admins';

/**
 * Swagger CreateAdmin.phone example is `0938…` (leading zero).
 * FE stores 10 digits without the trunk prefix.
 */
export function toNestAdminPhone(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('9')) return `0${digits}`;
  if (digits.length === 11 && digits.startsWith('09')) return digits;
  return digits;
}

export function toNestCreateAdminDto(
  input: Pick<
    CreateOrganizationalUserInput,
    'firstName' | 'lastName' | 'mobile' | 'role'
  >
): NestCreateAdminDto {
  if (!isStaffAdminRole(input.role)) {
    throw new Error('این نقش از مسیر ایجاد ادمین پشتیبانی نمی‌شود.');
  }

  return {
    fname: input.firstName.trim(),
    lname: input.lastName.trim(),
    phone: toNestAdminPhone(input.mobile),
    role: toNestAdminAccountRole(input.role),
  };
}
