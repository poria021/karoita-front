import {
  workbenchAllowsAdSpot,
  workbenchLayoutKindFor,
  type WorkbenchLayoutOptions,
} from '@/lib/workbench-grid';
import type { UserRole } from '@/types/auth';

/**
 * همان گزینه‌های لی‌اوت که `DashboardBulletinsBoard` به `workbenchLayoutForRole`
 * می‌دهد — اسکلتون و بورد واقعی باید یکی باشند.
 */
export function workbenchLayoutOptionsForRole(
  role: UserRole
): WorkbenchLayoutOptions {
  const kind = workbenchLayoutKindFor(role);
  const showLessonReports = kind === 'evaluation';
  return {
    showAd: workbenchAllowsAdSpot(role),
    showCourseAverages: showLessonReports,
    showCourseCapacities: role === 'supervisor_professor',
    showCoursePendingReports: showLessonReports,
    showStudentGradeRanking: kind === 'evaluation',
    showStudentGradesCard: kind === 'evaluation',
    showPendingBesideAnnouncements:
      role === 'mentor_teacher' || role === 'school_principal',
    showTeacherCount: role === 'school_principal',
    showRegionalCounts:
      role === 'regional_edu_admin' ||
      role === 'faculty_role' ||
      role === 'provincial_university' ||
      role === 'central_organization',
  };
}
