
export type UserRole =
  | 'student'
  | 'skill_learner'
  | 'supervisor_professor'
  | 'mentor_teacher'
  | 'school_principal'
  | 'regional_edu_admin'
  | 'faculty_role'
  | 'provincial_university'
  | 'assistant_admin'
  | 'central_organization'
  | 'super_admin';

export type DocStatus = 'not_submitted' | 'pending_admin' | 'approved' | 'rejected';

/**
 * مجوزهای نمایشی mock؛ مجوز واقعی همچنان باید در Nest اعمال شود.
 */
export type UserSpecialPermissions = {
  crossFaculty?: boolean;
  readOnly?: boolean;
};

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  role: UserRole;
  approved: boolean;
  docStatus: DocStatus;
  hasPassword?: boolean;
  adminRequestMessage?: string;
  province?: string;
  city?: string;
  college?: string;
  district?: string;
  school?: string;
  major?: string;
  personalCode?: string;
  studentId?: string;
  skillCode?: string;
  docUrl?: string;
  docType?: string;
  lastChange?: number;
  specialPermissions?: UserSpecialPermissions;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: string;
}
