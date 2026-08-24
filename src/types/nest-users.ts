/**
 * Nest Users / Files / Auth User DTOs from
 * https://backenddev.darkube.ir/docs (OpenAPI 3).
 * Domain `User` in `auth.ts` stays FE-shaped; mappers convert at the facade.
 */

export type NestFileType = {
  id: string;
  path: string;
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

/**
 * Swagger schema for rejectDescription:
 * { id: number, description: string }
 * id=1 is used as a generic placeholder from the FE side.
 */
export type NestRejectDescription = {
  id: number;
  description: string;
};

/**
 * PATCH /api/v1/users/{id}
 * Role-based location fields per Swagger:
 * - teacher/school_admin  → provinceIds[], cityIds[], schoolIds[], educationalDistrictsIds[]
 * - mentor/supervisor     → provinceIds[], universityIds[]
 * - student/trainee       → single provinceId, universityId, degreeId
 *
 * For approval/reject actions only `documentStatus` (and optionally
 * `rejectDescription`) are sent. All other fields are optional so we
 * never overwrite user data with empty strings.
 */
export type NestUpdateUserDto = {
  firstName?: string;
  lastName?: string;
  // singular (student / trainee)
  provinceId?: string;
  universityId?: string;
  degreeId?: string;
  // plural (teacher / school_admin / mentor / supervisor)
  provinceIds?: string[];
  universityIds?: string[];
  cityIds?: string[];
  schoolIds?: string[];
  educationalDistrictsIds?: string[];
  userUniqueId?: string;
  documentStatus: NestDocumentStatus;
  rejectDescription?: NestRejectDescription[];
  password?: string;
  photo?: NestFileDto;
  role?: NestRoleDto;
  status?: NestStatusDto;
};

export type NestUsersListQuery = {
  page?: number;
  limit?: number;
  /** JSON string, e.g. `{"status":"PENDING"}` */
  filters?: string;
  sort?: string;
};

export type NestFileUploadDto = {
  fileName: string;
  fileSize: number;
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
