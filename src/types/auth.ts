/**
 * Auth domain types — single source of truth for user roles, the flat
 * (MongoDB-compatible) `User` DTO, and the `Session` shape returned by
 * `AuthService`.
 *
 * Per rule 40 (#4, Mock DB to MongoDB Schema Mapping), mock data produced
 * inside `src/services/` must return this exact shape so nothing needs to
 * change once the real NestJS API is wired in.
 */

/** All 11 roles supported by the Karvita platform (see original-karvita.html). */
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

/** Identity document review state, driving the profile approval banners. */
export type DocStatus = 'not_submitted' | 'pending_admin' | 'approved' | 'rejected';

/**
 * Flat, MongoDB-compatible user record. Never include secrets (password
 * hashes, OTP codes) on this type — it is the exact shape returned to the
 * client and stored inside `useUserStore`.
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  role: UserRole;
  approved: boolean;
  docStatus: DocStatus;
  province?: string;
  college?: string;
  district?: string;
  school?: string;
  personalCode?: string;
  studentId?: string;
  skillCode?: string;
}

/** Active session envelope returned by `AuthService` on login/registration. */
export interface Session {
  user: User;
  token: string;
  expiresAt: string;
}
