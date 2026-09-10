import { toNestAdminPhone } from '@/services/admin-user-creation/real/to-nest-admin-create';
import type {
  CreateOrganizationalUserInput,
  UpdateOrganizationalUserInput,
} from '@/types/admin-user-creation';
import type {
  NestCreateAccountUserDto,
  NestUpdateAccountUserDto,
} from '@/types/nest-account-users';

/**
 * بدنهٔ POST /api/v1/admin/account-users. `roleId` را قبلاً از
 * `resolveOrganizationalRoleId` گرفته باش. DTO زندهٔ Nest فیلد دانشکده/پردیس
 * (`college`) ندارد — فقط province/city/educationDistrict را می‌پذیرد.
 */
export function toNestCreateAccountUserDto(
  input: Pick<
    CreateOrganizationalUserInput,
    'firstName' | 'lastName' | 'mobile' | 'password' | 'province' | 'city' | 'district'
  >,
  roleId: string
): NestCreateAccountUserDto {
  const dto: NestCreateAccountUserDto = {
    fname: input.firstName.trim(),
    lname: input.lastName.trim(),
    phone: toNestAdminPhone(input.mobile),
    password: input.password.trim(),
    role: roleId,
  };

  if (input.province?.trim()) dto.province = input.province.trim();
  if (input.city?.trim()) dto.city = input.city.trim();
  if (input.district?.trim()) dto.educationDistrict = input.district.trim();

  return dto;
}

/** بدنهٔ PATCH /api/v1/admin/account-users/{id} — همان فیلدهای create؛ password اختیاری است. */
export function toNestUpdateAccountUserDto(
  input: UpdateOrganizationalUserInput,
  roleId: string
): NestUpdateAccountUserDto {
  const dto: NestUpdateAccountUserDto = {
    fname: input.firstName.trim(),
    lname: input.lastName.trim(),
    phone: toNestAdminPhone(input.mobile),
    role: roleId,
  };

  if (input.password?.trim()) dto.password = input.password.trim();
  if (input.province?.trim()) dto.province = input.province.trim();
  if (input.city?.trim()) dto.city = input.city.trim();
  if (input.district?.trim()) dto.educationDistrict = input.district.trim();

  return dto;
}
