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


export type ProfileDto = z.infer<typeof profileSchema>;
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

export type AdminOnlyProfileDto = Extract<
  ProfileDto,
  { role: 'super_admin' | 'central_organization' | 'assistant_admin' }
>;

export type UpdateProfileDto = ProfileDto & {
  identityDoc?: File | null;
};
