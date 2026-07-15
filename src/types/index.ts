export type UserRole = 
  | 'student' | 'skill_learner' | 'supervisor_professor' 
  | 'mentor_teacher' | 'school_principal' | 'super_admin' 
  | 'central_organization' | 'provincial_university' | 'faculty_role' 
  | 'assistant_admin' | 'regional_edu_admin';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  role: UserRole;
  approved: boolean;
  docStatus: 'not_submitted' | 'pending_admin' | 'approved' | 'rejected';
  province?: string;
  college?: string;
  district?: string;
  school?: string;
  major?: string;
  personalCode?: string;
  studentId?: string;
  skillCode?: string;
  hasPassword: boolean;
  customScopes: {
    provinces: string[];
    cities: string[];
    colleges: string[];
    districts: string[];
    schools: string[];
  };
  specialPermissions: {
    readOnly: boolean;
    managementReports: boolean;
    crossFaculty: boolean;
    manageAds: boolean;
  };
}

export interface ReportWeek {
  id: string | number;
  title: string;
  state: 'draft' | 'pending' | 'needs_edit' | 'approved' | 'graded' | 'archived';
  score: number | null;
  weight: number;
  status: 'active' | 'archived';
  text: string;
  files: { name: string; size: number }[];
  feedback: {
    advisor: string;
    mentor: string;
    principal: string;
    mentor_rating?: string;
    principal_rating?: string;
  };
  readBy: {
    supervisor_professor: boolean;
    mentor_teacher: boolean;
    school_principal: boolean;
  };
}

export interface Internship {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  status: 'not_started' | 'ongoing' | 'completed' | 'dropped';
  grade: number | null;
  supervisorId: string | null;
  supervisor: string | null;
  mentorId: string | null;
  mentorName: string | null;
  schoolName: string | null;
  semester: string;
  weeks: ReportWeek[];
  removalPending?: boolean;
  wasDropped?: boolean;
}