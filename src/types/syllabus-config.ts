export type SyllabusConfigSubTab = 'course_offerings' | 'term_settings';

export type AcademicTermType = 'semester' | 'modular';

export type CourseOfferingKind = 'internship' | 'apprenticeship';

export type SyllabusWeekStatus = 'active' | 'archived';

export type AcademicTerm = {
  id: string;
  title: string;
  type: AcademicTermType;
  isEnrollOpen: boolean;
  isTermOpen: boolean;
  enrollStart: string;
  termStart: string;
};

export type SyllabusWeek = {
  id: string;
  suffix: string;
  title: string;
  weight: number;
  status: SyllabusWeekStatus;
};

export type CourseOfferingCatalogItem = {
  title: string;
  type: CourseOfferingKind;
};

export type CourseSyllabusConfig = {
  weeks: SyllabusWeek[];
};

export type MockInternshipRecord = {
  id: string;
  semester: string;
  title: string;
};

export type SyllabusConfigSnapshot = {
  terms: AcademicTerm[];
  /** کلید: `C::${termTitle}::${normalizedCourseTitle}` */
  offerings: Record<string, CourseSyllabusConfig>;
  internships: MockInternshipRecord[];
  globalProfessorCapacity: number;
  passingScoreThreshold: number;
  selectedTermTitle: string;
};

export type TermGateState = {
  isEnrollOpen: boolean;
  isTermOpen: boolean;
  enrollStart: string;
  termStart: string;
};

export type UpsertTermInput = {
  type: AcademicTermType;
  titlePrefix: string;
  academicYear: string;
};
