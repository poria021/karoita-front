/**
 * Shared domain types barrel. Canonical `User` / `UserRole` live in `./auth`.
 */
export type { DocStatus, Session, User, UserRole } from './auth';

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
