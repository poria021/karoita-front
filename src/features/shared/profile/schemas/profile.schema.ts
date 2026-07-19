/**
 * Canonical schema lives in `src/services/profile/profile.schema.ts`
 * so Facades can validate without importing features.
 */
export {
  createProfileSchema,
  facultyRoleProfileSchema,
  mentorTeacherProfileSchema,
  profileSchema,
  provincialUniversityProfileSchema,
  regionalEduAdminProfileSchema,
  schoolPrincipalProfileSchema,
  skillLearnerProfileSchema,
  studentProfileSchema,
  supervisorProfessorProfileSchema,
  type ProfileSchema,
} from '@/services/profile/profile.schema';
