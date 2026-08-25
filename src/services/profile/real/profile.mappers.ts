import type { DocStatus, User, UserRole } from '@/types/auth';
import { profileSchema } from '@/services/profile/profile.schema';
import type { ProfileDto } from '@/types/profile';

export class ProfileServiceError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = 'ProfileServiceError';
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseProfile(value: unknown): ProfileDto {
  const result = profileSchema.safeParse(value);
  if (!result.success) {
    const firstMessage = result.error.issues[0]?.message;
    throw new ProfileServiceError(
      firstMessage ?? 'اطلاعات پروفایل کامل یا معتبر نیست.'
    );
  }
  return result.data;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

/** فیلدهای سازمانی چندانتخابی مثل province/city/college/district/school آرایه هستند. */
function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((item): item is string => typeof item === 'string');
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function asDocStatus(value: unknown): DocStatus | undefined {
  if (
    value === 'not_submitted' ||
    value === 'pending_admin' ||
    value === 'approved' ||
    value === 'rejected'
  ) {
    return value;
  }
  return undefined;
}

function asUserRole(value: unknown): UserRole | undefined {
  if (
    value === 'student' ||
    value === 'skill_learner' ||
    value === 'supervisor_professor' ||
    value === 'mentor_teacher' ||
    value === 'school_principal' ||
    value === 'regional_edu_admin' ||
    value === 'faculty_role' ||
    value === 'provincial_university' ||
    value === 'assistant_admin' ||
    value === 'central_organization' ||
    value === 'super_admin'
  ) {
    return value;
  }
  return undefined;
}

export function mergeRecordIntoUser(
  activeUser: User,
  record: Record<string, unknown>
): User {
  return {
    ...activeUser,
    id: asString(record.id) ?? activeUser.id,
    firstName: asString(record.firstName) ?? activeUser.firstName,
    lastName: asString(record.lastName) ?? activeUser.lastName,
    mobile: asString(record.mobile) ?? activeUser.mobile,
    role: asUserRole(record.role) ?? activeUser.role,
    approved: asBoolean(record.approved) ?? activeUser.approved,
    docStatus: asDocStatus(record.docStatus) ?? activeUser.docStatus,
    hasPassword: asBoolean(record.hasPassword) ?? activeUser.hasPassword,
    adminRequestMessage:
      asString(record.adminRequestMessage) ?? activeUser.adminRequestMessage,
    province: asStringArray(record.province) ?? activeUser.province,
    city: asStringArray(record.city) ?? activeUser.city,
    college: asStringArray(record.college) ?? activeUser.college,
    district: asStringArray(record.district) ?? activeUser.district,
    school: asStringArray(record.school) ?? activeUser.school,
    major: asString(record.major) ?? activeUser.major,
    personalCode: asString(record.personalCode) ?? activeUser.personalCode,
    studentId: asString(record.studentId) ?? activeUser.studentId,
    skillCode: asString(record.skillCode) ?? activeUser.skillCode,
    docUrl: asString(record.docUrl) ?? activeUser.docUrl,
    docType: asString(record.docType) ?? activeUser.docType,
  };
}

export function userIdFromToken(token?: string): string | null {
  if (!token) return null;
  const normalized = token.replace(/^Bearer\s+/i, '').trim();
  const match = /^mock\.(.+)\.\d+$/.exec(normalized);
  return match?.[1] ?? null;
}

export function extractApiPayload(payload: unknown): unknown {
  if (isRecord(payload) && 'data' in payload) return payload.data;
  return payload;
}

export function isPersianMessage(message: string): boolean {
  return /[\u0600-\u06FF]/.test(message);
}

export function extractApiMessage(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.message === 'string') return payload.message;
  if (Array.isArray(payload.message)) {
    const messages = payload.message.filter(
      (message): message is string => typeof message === 'string'
    );
    return messages.length > 0 ? messages.join('، ') : null;
  }
  return typeof payload.error === 'string' ? payload.error : null;
}
