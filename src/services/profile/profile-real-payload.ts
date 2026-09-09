import { OrganizationOptionsService } from '@/services/organization-options.service';
import type { NestDocumentStatus, NestUpdateUserDto } from '@/types/nest-users';
import type { DocStatus, UserRole } from '@/types/auth';
import type { ProfileDto } from '@/types/profile';
import { isSuperAdminRole } from '@/utils/RoleStrategyMap';
import type { OrganizationField } from '@/utils/roleFieldStrategy';

/**
 * `PATCH /api/v1/auth/me` فیلد سازمانی نمی‌پذیرد و بی‌صدا دور می‌اندازد.
 * ذخیرهٔ پروفایل خود کاربر با `NestUpdateUserDto` روی `PATCH /api/v1/users/{id}` است.
 * اگر ۴۰۳ آمد، یا فیلدها باید به `AuthUpdateDto` اضافه شوند یا self-PATCH مجاز شود.
 */

/** برچسب → id؛ اگر پیدا نشد رشتهٔ خالی. */
async function resolveLabelToId(
  type: OrganizationField,
  label: string | undefined,
  scope?: { province?: string; city?: string; district?: string; role?: UserRole }
): Promise<string> {
  const trimmed = label?.trim();
  if (!trimmed) return '';

  try {
    const result = await OrganizationOptionsService.getOptions({
      type,
      query: trimmed,
      page: 1,
      limit: 25,
      province: scope?.province,
      city: scope?.city,
      district: scope?.district,
      role: scope?.role,
    });
    const exact = result.items.find((item) => item.label === trimmed);
    if (!exact && process.env.NODE_ENV !== 'production') {
      console.warn(
        `[profile-real-payload] مقدار "${trimmed}" برای «${type}» در فهرست سرور پیدا نشد — ارسال نمی‌شود.`
      );
    }
    return exact?.id ?? '';
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[profile-real-payload] resolve «${type}» ناموفق بود:`, error);
    }
    return '';
  }
}

/** آرایهٔ برچسب → آرایهٔ id؛ خالی‌ها حذف می‌شوند. */
async function resolveLabelsToIds(
  type: OrganizationField,
  labels: string[] | undefined,
  scope?: { province?: string; city?: string; district?: string; role?: UserRole }
): Promise<string[]> {
  if (!labels?.length) return [];
  const ids = await Promise.all(
    labels.map((label) => resolveLabelToId(type, label, scope))
  );
  return ids.filter(Boolean);
}

function toNestDocumentStatus(
  role: UserRole,
  currentDocStatus: DocStatus
): NestDocumentStatus {
  if (isSuperAdminRole(role)) return 'CONFIRM';
  if (currentDocStatus === 'approved') return 'CONFIRM';
  return 'PENDING';
}

/**
 * `ProfileDto` → `NestUpdateUserDto` برای `PATCH /api/v1/users/{id}`.
 * Swagger تکی و آرایه‌ای را بر اساس نقش جدا می‌کند؛ هر دو را می‌فرستیم تا بک‌اند انتخاب کند.
 */
export async function buildNestUpdateUserBody(
  data: ProfileDto,
  currentDocStatus: DocStatus,
  /** شناسهٔ فایل بعد از آپلود S3 — اگر باشد به `NestUpdateUserDto.photo` می‌رود. */
  photoFileId?: string
): Promise<NestUpdateUserDto> {
  const provinceNames = 'province' in data
    ? (typeof data.province === 'string' ? (data.province ? [data.province] : []) : (data.province ?? []))
    : [];
  const districtNames = 'district' in data ? (data.district ?? []) : [];
  const collegeNames  = 'college' in data
    ? (typeof data.college === 'string' ? (data.college ? [data.college] : []) : (data.college ?? []))
    : [];
  const cityNames     = 'city'     in data ? (data.city     ?? []) : [];
  const schoolNames   = 'school'   in data ? (data.school   ?? []) : [];
  const majorName     = 'major'    in data ? data.major : undefined;

  const primaryProvince  = provinceNames[0];
  const primaryCity      = cityNames[0];
  const primaryDistrict  = districtNames[0];

  const [
    provinceIds,
    universityIds,
    degreeIds,
    cityIds,
    schoolIds,
    educationalDistrictsIds,
  ] = await Promise.all([
    resolveLabelsToIds('province', provinceNames),
    resolveLabelsToIds('college',  collegeNames, { province: primaryProvince }),
    majorName
      ? resolveLabelToId('major', majorName, { role: data.role }).then((id) =>
          id ? [id] : []
        )
      : Promise.resolve([] as string[]),
    resolveLabelsToIds('city',     cityNames,    { province: primaryProvince }),
    resolveLabelsToIds('school',   schoolNames,  { province: primaryProvince, district: primaryDistrict }),
    resolveLabelsToIds('district', districtNames,{ province: primaryProvince, city: primaryCity }),
  ]);

  const userUniqueId =
    ('studentId'    in data && data.studentId)    ||
    ('skillCode'    in data && data.skillCode)    ||
    ('personalCode' in data && data.personalCode) ||
    '';

  return {
    firstName: data.firstName,
    lastName:  data.lastName,
    // تکی: student / trainee
    provinceId:             provinceIds[0]             ?? '',
    universityId:           universityIds[0]           ?? '',
    degreeId:               degreeIds[0]               ?? '',
    // آرایه: teacher / school_admin / mentor / supervisor
    provinceIds,
    universityIds,
    cityIds,
    schoolIds,
    educationalDistrictsIds,
    userUniqueId,
    documentStatus: toNestDocumentStatus(data.role, currentDocStatus),
    // عکس فقط اگر در این submit فایل جدید آپلود شده باشد
    ...(photoFileId ? { photo: { id: photoFileId } } : {}),
  };
}
