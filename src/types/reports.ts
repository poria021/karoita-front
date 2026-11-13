import type { ReportSlug } from '@/types/report-access';

export type { ReportSlug };

export type ReportPeriodMode = 'term' | 'module';

export type ReportScoreStatus = 'pass' | 'fail' | 'none';

export type ReportFilterKey =
  | 'province'
  | 'city'
  | 'region'
  | 'school'
  | 'faculty'
  | 'professor'
  | 'teacher'
  | 'course'
  | 'major'
  | 'status';

export type ReportFilters = Partial<Record<ReportFilterKey, string>>;

export type ReportSort = {
  id: string;
  dir: 'asc' | 'desc';
};

export type ReportPeriodState = {
  mode: ReportPeriodMode;
  termId: string;
  moduleId: string;
};

export type ReportOption = {
  value: string;
  label: string;
  group?: string;
};

export type ReportColumnKind =
  | 'text'
  | 'phone'
  | 'two-line'
  | 'percent'
  | 'count'
  | 'status'
  | 'courses'
  | 'scores-action';

export type ReportColumnDef = {
  id: string;
  title: string;
  kind: ReportColumnKind;
  /** فیلد مرتب‌سازی روی ردیف */
  sortKey?: string;
  nosort?: boolean;
  secondaryKey?: string;
};

export type ReportRow = {
  id: string;
  s: string;
  name?: string;
  phone?: string;
  code?: string;
  major?: string;
  courses?: string[];
  courseText?: string;
  status?: ReportScoreStatus;
  att?: number;
  attProf?: number;
  attMgr?: number;
  resp?: number;
  score?: number;
  days?: number;
  n?: number;
  nT?: number;
  nP?: number;
  nF?: number;
  province?: string;
  provName?: string;
  city?: string;
  cityName?: string;
  region?: string;
  regionName?: string;
  school?: string;
  schoolName?: string;
  faculty?: string;
  facName?: string;
  professor?: string;
  profName?: string;
  teacher?: string;
  teacherName?: string;
  principalName?: string;
  principalCode?: string;
  head?: string;
  [key: string]: unknown;
};

export type ReportQueryInput = {
  slug: ReportSlug;
  filters: ReportFilters;
  query: string;
  period: ReportPeriodState;
  sort: ReportSort | null;
  page: number;
  pageSize?: number;
};

export type ReportQueryResult = {
  rows: ReportRow[];
  total: number;
  page: number;
  pageSize: number;
  columns: ReportColumnDef[];
};

export type ReportFilterCatalog = {
  provinces: ReportOption[];
  cities: ReportOption[];
  regions: ReportOption[];
  schools: ReportOption[];
  faculties: ReportOption[];
  professors: ReportOption[];
  teachers: ReportOption[];
  courses: ReportOption[];
  majors: ReportOption[];
  statuses: ReportOption[];
  terms: ReportOption[];
  modules: ReportOption[];
};

export type ReportLearnerCourseDetail = {
  learnerId: string;
  learnerName: string;
  periodLabel: string;
  courses: { id: string; name: string; code: string }[];
};

export type ReportLearnerScoreDetail = {
  learnerId: string;
  learnerName: string;
  periodLabel: string;
  courses: {
    id: string;
    name: string;
    average: number | null;
    sessions: (number | null)[];
  }[];
};

export type ReportCompareMetric = {
  key: string;
  title: string;
};

export type ReportCompareItem = {
  id: string;
  name: string;
  subtitle?: string;
  metrics: Record<string, number>;
  info: { label: string; value: string }[];
};
