/**
 * DTO کاربران/فایل/Auth User از OpenAPI لایو.
 * دامنهٔ `User` در `auth.ts` شکل فرانت می‌ماند؛ mapper در facade تبدیل می‌کند.
 */

export type NestFileType = {
  id: string;
  path: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  uploadedById?: string;
  status?: string;
  confirmedAt?: string;
};

export type NestRole = {
  id: string;
  name: string;
};

export type NestStatus = {
  id: string;
  name: string;
};

export type NestUserDto = {
  id: string;
  phone: string;
  provider: string;
  socialId: string;
  firstName: string;
  lastName: string;
  photo: NestFileType;
  role: NestRole;
  status: NestStatus;
  userUniqueId: string;
  city: unknown;
  educationalDistrict: unknown;
  school: unknown;
  documentStatus?: NestDocumentStatus;
  /** شکل GET تأیید نشده (آرایه یا تک‌آبجکت) — ببین readRejectMessage در nest-auth-mappers.ts. */
  rejectDescription?: NestRejectDescription[] | NestRejectDescription;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type NestInfinityPaginationUserResponse = {
  data: NestUserDto[];
  hasNextPage: boolean;
};

export type NestDocumentStatus = 'PENDING' | 'CONFIRM' | 'REJECT' | 'NOTINIT';

export type NestRoleDto = {
  id: string;
  name:
    | 1
    | 2
    | 'manager'
    | 'student'
    | 'trainee'
    | 'mentor'
    | 'teacher'
    | 'school_admin'
    | 'admin';
};

export type NestFileDto = {
  id: string;
};

export type NestStatusDto = {
  id: unknown;
};

/** Swagger: `{ id: number, description: string }`؛ فرانت `id=1` را به‌عنوان placeholder می‌فرستد. */
export type NestRejectDescription = {
  id: number;
  description: string;
};

/**
 * PATCH /api/v1/users/{id} — فیلد مکان بر اساس نقش جمع/مفرد است.
 * برای تأیید/رد فقط `documentStatus` (و در صورت رد `rejectDescription`) بفرست تا داده خالی بازنویسی نشود.
 */
export type NestUpdateUserDto = {
  firstName?: string;
  lastName?: string;
  // دانشجو/کارآموز: مفرد
  provinceId?: string;
  universityId?: string;
  degreeId?: string;
  // معلم/مدیر مدرسه/منتور/سوپروایزر: جمع
  provinceIds?: string[];
  universityIds?: string[];
  cityIds?: string[];
  schoolIds?: string[];
  educationalDistrictsIds?: string[];
  userUniqueId?: string;
  documentStatus: NestDocumentStatus;
  /** مثال PATCH در Swagger تک‌آبجکت است نه آرایه. */
  rejectDescription?: NestRejectDescription;
  password?: string;
  photo?: NestFileDto;
  role?: NestRoleDto;
  status?: NestStatusDto;
};

export type NestUsersListQuery = {
  page?: number;
  limit?: number;
  /** رشتهٔ JSON مثلاً `{"status":"PENDING"}`. */
  filters?: string;
  sort?: string;
};

export type NestFileUploadDto = {
  fileName: string;
  fileSize: number;
  mimeType: string;
};

export type NestFileResponseDto = {
  file: NestFileType;
  uploadSignedUrl: string;
};

export type NestAuthUpdateDto = {
  photo?: NestFileDto;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  oldPassword?: string;
};

/** `POST /v1/auth/set/password` — تغییر رمز وقتی حساب از قبل رمز دارد. */
export type NestSetPasswordDto = {
  oldPassword: string;
  newPassword: string;
};
