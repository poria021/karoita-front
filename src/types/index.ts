export type UserRole =
  | "student"
  | "skill_learner"
  | "supervisor_professor"
  | "mentor_teacher"
  | "school_principal"
  | "super_admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
