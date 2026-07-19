import type { z } from 'zod';

import {
  facultyRoleProfileSchema,
  mentorTeacherProfileSchema,
  profileSchema,
  provincialUniversityProfileSchema,
  regionalEduAdminProfileSchema,
  schoolPrincipalProfileSchema,
  skillLearnerProfileSchema,
  studentProfileSchema,
  supervisorProfessorProfileSchema,
} from '@/services/profile/profile.schema';

/**
 * Profile DTOs — inferred from the polymorphic Zod schemas in
 * `src/services/profile/profile.schema.ts` (services must not import features).
 */

/** Full discriminated profile payload (any role). */
export type ProfileDto = z.infer<typeof profileSchema>;
/** REST-facing alias retained for the NestJS DTO naming convention. */
export type ProfileDTO = ProfileDto;

export type StudentProfileDto = z.infer<typeof studentProfileSchema>;
export type SkillLearnerProfileDto = z.infer<typeof skillLearnerProfileSchema>;
export type SupervisorProfessorProfileDto = z.infer<
  typeof supervisorProfessorProfileSchema
>;
export type MentorTeacherProfileDto = z.infer<typeof mentorTeacherProfileSchema>;
export type SchoolPrincipalProfileDto = z.infer<
  typeof schoolPrincipalProfileSchema
>;
export type RegionalEduAdminProfileDto = z.infer<
  typeof regionalEduAdminProfileSchema
>;
export type FacultyRoleProfileDto = z.infer<typeof facultyRoleProfileSchema>;
export type ProvincialUniversityProfileDto = z.infer<
  typeof provincialUniversityProfileSchema
>;

/**
 * Admin-tier roles (`super_admin` | `central_organization` | `assistant_admin`)
 * share one schema branch; narrow with `Extract` when a single role is needed.
 */
export type AdminOnlyProfileDto = Extract<
  ProfileDto,
  { role: 'super_admin' | 'central_organization' | 'assistant_admin' }
>;

/** Profile form submit payload including optional identity document upload. */
export type UpdateProfileDto = ProfileDto & {
  identityDoc?: File | null;
};
