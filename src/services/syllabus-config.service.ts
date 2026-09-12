import {
  DEFAULT_WEEK_WEIGHT,
  getAcademicYearOptions,
  isTermGateActive,
} from '@/services/syllabus-config/mock/mock-syllabus-store';
import type { EnrollmentSyllabusContext } from '@/services/syllabus-config/syllabus-enrollment-reads';

import { courseOfferingQueries } from './syllabus-config/service/course-offering-queries';
import { offeringMutations } from './syllabus-config/service/offering-mutations';
import { settingsMutations } from './syllabus-config/service/settings-mutations';
import { snapshotQueries } from './syllabus-config/service/snapshot-queries';
import { termMutations } from './syllabus-config/service/term-mutations';

/**
 * نمای سرفصل ترم و هفته. UI فقط همین Facade را صدا می‌زند.
 * `getEnrollmentSyllabusContext` تا آمدن route مصرف‌کننده در Nest خالی برمی‌گردد.
 */
export const SyllabusConfigService = {
  ...snapshotQueries,
  ...courseOfferingQueries,
  ...offeringMutations,
  ...termMutations,
  ...settingsMutations,
};

export { DEFAULT_WEEK_WEIGHT, getAcademicYearOptions, isTermGateActive };
export type { EnrollmentSyllabusContext };
