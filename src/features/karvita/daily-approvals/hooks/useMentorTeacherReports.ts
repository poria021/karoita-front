'use client';

import { useQuery } from '@tanstack/react-query';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { MentorTeacherReportsService } from '@/services/mentor-teacher-reports.service';
import {
  canCompareReportForUser,
  hasReportAccessForUser,
  resolveReportAccessKey,
} from '@/services/report-access-policy';
import { useUserStore } from '@/store/useUserStore';
import type { MentorReportsRole } from '@/types/mentor-teacher-reports';

export function useMentorTeacherReports(roleOverride?: MentorReportsRole) {
  const activeUser = useUserStore((state) => state.activeUser);
  const activeRole = activeUser?.role;
  const role: MentorReportsRole =
    roleOverride ??
    (activeRole === 'supervisor_professor' ||
    activeRole === 'school_principal' ||
    activeRole === 'regional_edu_admin' ||
    activeRole === 'faculty_role' ||
    activeRole === 'provincial_university' ||
    activeRole === 'central_organization' ||
    activeRole === 'super_admin' ||
    activeRole === 'assistant_admin'
      ? activeRole
      : 'mentor_teacher');

  const accessKey = resolveReportAccessKey(role);
  const canViewReport = hasReportAccessForUser(activeUser, role, accessKey);
  const canCompare = canCompareReportForUser(activeUser, role, accessKey);

  const query = useQuery({
    queryKey: [...DASHBOARD_QUERY.mentorTeacherReports, role, canViewReport, canCompare],
    queryFn: async () => {
      if (!canViewReport) {
        return {
          summary: [],
          students: [],
          feedback: [],
        };
      }

      return MentorTeacherReportsService.listReports(role);
    },
    staleTime: QUERY_STALE_MS.list,
    retry: false,
    enabled: Boolean(activeUser) || Boolean(roleOverride),
  });

  return {
    summary: query.data?.summary ?? [],
    students: query.data?.students ?? [],
    feedback: query.data?.feedback ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    role,
    canViewReport,
    canCompare,
    isBlocked: !canViewReport,
  };
}
