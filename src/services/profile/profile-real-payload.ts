import { OrganizationOptionsService } from '@/services/organization-options.service';
import type { NestDocumentStatus, NestUpdateUserDto } from '@/types/nest-users';
import type { DocStatus, UserRole } from '@/types/auth';
import type { ProfileDto } from '@/types/profile';
import { isSuperAdminRole } from '@/utils/RoleStrategyMap';
import type { OrganizationField } from '@/utils/roleFieldStrategy';

/**
 * PATCH /api/v1/auth/me (`NestAuthUpdateDto`) فقط firstName/lastName/email/
 * password/photo را می‌پذیرد — فیلدهای سازمانی (استان/دانشکده/رشته/کد و ...)
 * اصلاً در آن DTO تعریف نشده‌اند و بی‌صدا نادیده گرفته می‌شوند.
 *
 * تنها DTOیی که این فیلدها را می‌پذیرد `NestUpdateUserDto` است که با
 * PATCH /api/v1/users/{id} کار می‌کند (همان مسیری که ادمین برای ایجاد
 * حساب سازمانی استفاده می‌کند — بنگرید admin-user-creation.service.ts).
 * این فایل همان payload را برای «ذخیره پروفایل توسط خود کاربر» می‌سازد.
 *
 * ⚠️ نکته‌ی مهم: این مسیر باید روی بک‌اند واقعی تست شود — مشخص نیست کاربر
 * غیرادمین اجازه‌ی PATCH روی رکورد خودش را از همین endpoint دارد یا نه.
 * اگر ۴۰۳ برگرداند، راه‌حل واقعی این است که یا این فیلدها به
 * `AuthUpdateDto` (سمت بک‌اند) اضافه شوند، یا این endpoint برای «خود کاربر»
 * (self) مجاز شود.
 */

/** یک label رو به id تبدیل می‌کنه — اگه پیدا نشد رشتهٔ خالی برمی‌گردونه. */
async function resolveLabelToId(
  type: OrganizationField,
  label: string | undefined,
  scope?: { province?: string; district?: string; role?: UserRole }
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

/** یک آرایهٔ label رو به آرایهٔ id تبدیل می‌کنه — مقادیر خالی حذف می‌شن. */
async function resolveLabelsToIds(
  type: OrganizationField,
  labels: string[] | undefined,
  scope?: { province?: string; district?: string; role?: UserRole }
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
 * ProfileDto → NestUpdateUserDto برای PATCH /api/v1/users/{id}.
 *
 * Swagger می‌گوید:
 * - student/trainee       → provinceId (تکی), universityId (تکی), degreeId (تکی)
 * - mentor/supervisor     → provinceIds (آرایه), universityIds (آرایه)
 * - teacher/school_admin  → provinceIds (آرایه), cityIds (آرایه),
 *                           schoolIds (آرایه), educationalDistrictsIds (آرایه)
 *
 * برای سادگی هم فیلد تکی و هم آرایه‌ای رو می‌فرستیم تا بک‌اند
 * بر اساس role کاربر هر کدام که نیاز داشت استفاده کنه.
 */
export async function buildNestUpdateUserBody(
  data: ProfileDto,
  currentDocStatus: DocStatus,
  /** شناسهٔ فایل عکس بعد از آپلود به S3 — اگر ارسال شده به NestUpdateUserDto.photo اضافه می‌شود. */
  photoFileId?: string
): Promise<NestUpdateUserDto> {
  const provinceNames = 'province' in data ? (data.province ?? []) : [];
  const districtNames = 'district' in data ? (data.district ?? []) : [];
  const collegeNames  = 'college'  in data ? (data.college  ?? []) : [];
  const cityNames     = 'city'     in data ? (data.city     ?? []) : [];
  const schoolNames   = 'school'   in data ? (data.school   ?? []) : [];
  const majorName     = 'major'    in data ? data.major : undefined;

  const primaryProvince  = provinceNames[0];
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
    resolveLabelsToIds('college',  collegeNames),
    majorName
      ? resolveLabelToId('major', majorName, { role: data.role }).then((id) =>
          id ? [id] : []
        )
      : Promise.resolve([] as string[]),
    resolveLabelsToIds('city',     cityNames,    { province: primaryProvince }),
    resolveLabelsToIds('school',   schoolNames,  { province: primaryProvince, district: primaryDistrict }),
    resolveLabelsToIds('district', districtNames,{ province: primaryProvince }),
  ]);

  const userUniqueId =
    ('studentId'    in data && data.studentId)    ||
    ('skillCode'    in data && data.skillCode)    ||
    ('personalCode' in data && data.personalCode) ||
    '';

  return {
    firstName: data.firstName,
    lastName:  data.lastName,
    // تکی (student / trainee)
    provinceId:             provinceIds[0]             ?? '',
    universityId:           universityIds[0]           ?? '',
    degreeId:               degreeIds[0]               ?? '',
    // آرایه‌ای (teacher / school_admin / mentor / supervisor)
    provinceIds,
    universityIds,
    cityIds,
    schoolIds,
    educationalDistrictsIds,
    userUniqueId,
    documentStatus: toNestDocumentStatus(data.role, currentDocStatus),
    // عکس پروفایل — فقط زمانی اضافه می‌شه که کاربر در این submit عکس جدید آپلود کرده باشد
    ...(photoFileId ? { photo: { id: photoFileId } } : {}),
  };
}
