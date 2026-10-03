import {
  DEFAULT_WEEK_WEIGHT,
  isTermGateActive,
} from '@/services/syllabus-config/syllabus-term-gates';
import type { EnrollmentSyllabusContext } from '@/services/syllabus-config/syllabus-enrollment-reads';

import { courseCatalogMutations } from './syllabus-config/service/course-catalog-mutations';
import { courseOfferingQueries } from './syllabus-config/service/course-offering-queries';
import { offeringMutations } from './syllabus-config/service/offering-mutations';
import { settingsMutations } from './syllabus-config/service/settings-mutations';
import { snapshotQueries } from './syllabus-config/service/snapshot-queries';
import { termMutations } from './syllabus-config/service/term-mutations';

/**
 * نمای سرفصل ترم و هفته. UI فقط همین Facade را صدا می‌زند.
 * `getEnrollmentSyllabusContext` تا آمدن route مصرف‌کننده در Nest خالی برمی‌گردد.
 * تعریف داینامیک دروس (`*CourseDefinition*`) فعلاً فقط mock است و real fail-closed می‌شود.
 */
export const SyllabusConfigService = {
  ...snapshotQueries,
  ...courseOfferingQueries,
  ...offeringMutations,
  ...termMutations,
  ...settingsMutations,
  ...courseCatalogMutations,
};

export { DEFAULT_WEEK_WEIGHT, isTermGateActive };
export type { EnrollmentSyllabusContext };
