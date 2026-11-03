export type MentorReportsRole =
  | 'mentor_teacher'
  | 'supervisor_professor'
  | 'school_principal'
  | 'regional_edu_admin'
  | 'faculty_role'
  | 'provincial_university'
  | 'central_organization'
  | 'super_admin'
  | 'assistant_admin';

export type MentorTeacherReportStatus = 'approved' | 'pending' | 'revision';

export type MentorTeacherSummaryTone = 'brand' | 'success' | 'warning' | 'info';

export type MentorTeacherSummaryItem = {
  label: string;
  value: string;
  meta: string;
  tone: MentorTeacherSummaryTone;
};

export type MentorTeacherStudentReport = {
  id: string;
  name: string;
  school: string;
  course: string;
  week: string;
  status: MentorTeacherReportStatus;
  score: number;
  updatedAt: string;
};

export type MentorTeacherFeedbackItem = {
  id: string;
  title: string;
  body: string;
  author: string;
  time: string;
};

export type MentorTeacherReportsSnapshot = {
  summary: MentorTeacherSummaryItem[];
  students: MentorTeacherStudentReport[];
  feedback: MentorTeacherFeedbackItem[];
};
