import { degreeRoleApi } from './resources/degree-role.api';
import { educationSchoolApi } from './resources/education-school.api';
import { provinceCityApi } from './resources/province-city.api';
import { semesterLessonApi } from './resources/semester-lesson.api';
import { settingsCapacityApi } from './resources/settings-capacity.api';
import { universityApi } from './resources/university.api';

export { NEST_ADMIN_PATHS } from './paths';

export const adminCatalogApi = {
  ...provinceCityApi,
  ...educationSchoolApi,
  ...degreeRoleApi,
  ...universityApi,
  ...semesterLessonApi,
  ...settingsCapacityApi,
};

export {
  fetchAllNestCities,
  fetchAllNestDegrees,
  fetchAllNestEducations,
  fetchAllNestProvinces,
  fetchAllNestSchools,
  fetchAllNestUniversities,
} from './bulk-fetch';
