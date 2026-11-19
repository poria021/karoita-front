'use client';

import type { CSSProperties, ReactNode } from 'react';

import { DashboardCourseMaterialsBox } from '@/features/karvita/course-materials/components/DashboardCourseMaterialsBox';
import { WorkbenchCoursePendingReportsBox } from '@/features/karvita/dashboard/components/WorkbenchCoursePendingReportsBox';
import { WorkbenchStudentGradeRankingBox } from '@/features/karvita/dashboard/components/WorkbenchStudentGradeRankingBox';
import { WorkbenchSchoolRankingBox } from '@/features/karvita/dashboard/components/WorkbenchSchoolRankingBox';
import { WorkbenchTeacherResponseRankingBox } from '@/features/karvita/dashboard/components/WorkbenchTeacherResponseRankingBox';
import { WorkbenchAdBox } from '@/features/karvita/dashboard/components/WorkbenchAdBox';
import {
  WorkbenchAnnouncementsBox,
  workbenchAnnouncementActionsFor,
} from '@/features/karvita/dashboard/components/WorkbenchAnnouncementsBox';
import {
  WorkbenchApprovalsDonutBox,
  WorkbenchPendingQueueBox,
} from '@/features/karvita/dashboard/components/WorkbenchOnboardingApprovalsBox';
import { WorkbenchLearnerTypeCountsBox } from '@/features/karvita/dashboard/components/WorkbenchLearnerTypeCountsBox';
import { DashboardCourseAveragesChart } from '@/features/karvita/dashboard/components/DashboardCourseAveragesChart';
import { WorkbenchCreateOrgPanelLink } from '@/features/karvita/dashboard/components/WorkbenchCreateOrgPanelLink';
import { WorkbenchFacultyCountsBox } from '@/features/karvita/dashboard/components/WorkbenchFacultyCountsBox';
import { WorkbenchFacultyResponseRateBox } from '@/features/karvita/dashboard/components/WorkbenchFacultyResponseRateBox';
import { WorkbenchLearnerCountsBox } from '@/features/karvita/dashboard/components/WorkbenchLearnerCountsBox';
import { WorkbenchOrgStructureCountsBox } from '@/features/karvita/dashboard/components/WorkbenchOrgStructureCountsBox';
import { WorkbenchProfessorAttendanceRankingBox } from '@/features/karvita/dashboard/components/WorkbenchProfessorAttendanceRankingBox';
import { WorkbenchProfessorScoreRankingBox } from '@/features/karvita/dashboard/components/WorkbenchProfessorScoreRankingBox';
import { WorkbenchPublishedAnnouncementsBox } from '@/features/karvita/dashboard/components/WorkbenchPublishedAnnouncementsBox';
import { WorkbenchRegionalCountsBox } from '@/features/karvita/dashboard/components/WorkbenchRegionalCountsBox';
import { WorkbenchRegionalGenderBox } from '@/features/karvita/dashboard/components/WorkbenchRegionalGenderBox';
import { WorkbenchReportAccessBox } from '@/features/karvita/dashboard/components/WorkbenchReportAccessBox';
import { WorkbenchRoleUserCountsBox } from '@/features/karvita/dashboard/components/WorkbenchRoleUserCountsBox';
import { WorkbenchTeacherCountBox } from '@/features/karvita/dashboard/components/WorkbenchTeacherCountBox';
import { WorkbenchStudentGradesCard } from '@/features/karvita/dashboard/components/WorkbenchStudentGradesCard';
import { WorkbenchWeakRankingBox } from '@/features/karvita/dashboard/components/WorkbenchWeakRankingBox';
import { useDashboardCourseMaterials } from '@/features/karvita/dashboard/hooks/useDashboardCourseMaterials';
import { cn } from '@/lib/utils';
import {
  WORKBENCH_LEARNER_ANNOUNCEMENTS_STYLE,
  workbenchAdCellClass,
  workbenchAllowsAdSpot,
  workbenchCellClass,
  workbenchCellStyle,
  workbenchLayoutForRole,
  workbenchLayoutKindFor,
  type WorkbenchBoxSlot,
} from '@/lib/workbench-grid';
import type { UserRole } from '@/types/auth';
import type { Bulletin } from '@/types/bulletins';

import { useDashboardBulletins } from '../hooks/useDashboardBulletins';

type DashboardBulletinsBoardProps = {
  role: UserRole;
  leading: ReactNode;
};

/**
 * نقش‌هایی که جایگاه تبلیغ دارند، ستون تبلیغ را همیشه نگه می‌دارند؛
 * بدون تبلیغ فعال، جایگاه به‌صورت باکس خالی (خط‌چین) دیده می‌شود.
 */
function hasAdSpot(role: UserRole): boolean {
  return workbenchAllowsAdSpot(role);
}

/**
 * سلول‌های میز کار — فرزندان مستقیم شِل ۱۲ستونه.
 * محل از `workbenchLayoutForRole`؛ شکل لی‌اوت مثل قبل.
 */
export function DashboardBulletinsBoard({
  role,
  leading,
}: DashboardBulletinsBoardProps) {
  const data = useDashboardBulletins(role);
  const showAd = hasAdSpot(role);
  const kind = workbenchLayoutKindFor(role);
  // معلم / مدیر مدرسه / استاد راهنما: هر دو API درس (میانگین نمره + در انتظار بررسی).
  const showLessonReports = kind === 'evaluation';
  const slots = workbenchLayoutForRole(role, {
    showAd,
    showCourseAverages: showLessonReports,
    showCourseCapacities: role === 'supervisor_professor',
    showCoursePendingReports: showLessonReports,
    // برترین/ضعیف‌ترین فراگیران برای هر سه نقش ارزیابی؛ محدودهٔ داده را خود سرویس تعیین می‌کند.
    showStudentGradeRanking: kind === 'evaluation',
    // کارت نمرات برای نقش‌های ارزیابی (بالای تبلیغ وقتی تبلیغ هست).
    showStudentGradesCard: kind === 'evaluation',
    showRegionalCounts:
      role === 'regional_edu_admin' || role === 'faculty_role',
  });
  const actions = workbenchAnnouncementActionsFor(role);
  const announcementSource =
    kind === 'senior' ? 'received' : data.sources.announcement;

  return (
    <>
      {slots.map((slot) => (
        <WorkbenchBoardCell
          key={slot.id}
          slot={slot}
          role={role}
          leading={leading}
          announcements={data.announcements}
          ads={data.ads}
          isLoading={data.isLoading}
          isError={data.isError}
          isForbidden={data.isForbidden}
          announcementSource={announcementSource}
          canPublish={actions.canPublish}
          canReceive={actions.canReceive}
        />
      ))}
    </>
  );
}

function MaterialsCell({
  className,
  style,
}: {
  className: string;
  style?: CSSProperties;
}) {
  const materials = useDashboardCourseMaterials();
  return (
    <DashboardCourseMaterialsBox
      materials={materials.materials}
      materialsHrefByCourseKey={materials.materialsHrefByCourseKey}
      isLoading={materials.isLoading}
      className={className}
      style={style}
    />
  );
}

function WorkbenchBoardCell({
  slot,
  role,
  leading,
  announcements,
  ads,
  isLoading,
  isError,
  isForbidden,
  announcementSource,
  canPublish,
  canReceive,
}: {
  slot: WorkbenchBoxSlot;
  role: UserRole;
  leading: ReactNode;
  announcements: Bulletin[];
  ads: Bulletin[];
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  announcementSource: 'received' | 'published';
  canPublish: boolean;
  canReceive: boolean;
}) {
  const { id, placement } = slot;
  // ستون ۱۳ = ترک تبلیغ؛ باکسی که زیر تبلیغ می‌نشیند هم‌عرض خود تبلیغ می‌شود.
  const inAdTrack = id === 'ad' || placement.colStart === 13;
  const cellClass = inAdTrack
    ? workbenchAdCellClass(placement)
    : workbenchCellClass(placement);
  const cellStyle = workbenchCellStyle(placement);

  switch (id) {
    case 'welcome':
      return (
        <div className={cellClass} style={cellStyle}>
          {leading}
        </div>
      );
    case 'announcements':
      return (
        <WorkbenchAnnouncementsBox
          announcements={announcements}
          isLoading={isLoading}
          isError={isError}
          isForbidden={isForbidden}
          source={announcementSource}
          canPublish={canPublish}
          canReceive={canReceive}
          className={cn(
            cellClass,
            'overflow-hidden',
            // ارتفاع از ردیف (نه از لیست): هم‌قد باکس کناری، و لیست داخل باکس اسکرول می‌شود.
            placement.stretch && !placement.height && 'md:h-0 md:min-h-full'
          )}
          style={cellStyle}
        />
      );
    case 'ad': {
      const gradesAboveAd = slot.includes?.includes('student_grades_card');
      const countsBelowAd = slot.includes?.includes('regional_counts');
      if (gradesAboveAd || countsBelowAd) {
        // نمره (دانشکده / منطقه / فراگیران) بالای تبلیغ؛ آمار منطقه/دانشکده زیر آن.
        return (
          <div
            className={cn(cellClass, 'flex min-h-0 flex-col gap-kv-group')}
            style={cellStyle}
          >
            {gradesAboveAd ? (
              <WorkbenchStudentGradesCard
                role={role}
                compact={countsBelowAd}
              />
            ) : null}
            <WorkbenchAdBox
              ads={ads}
              isLoading={isLoading}
              isError={isError}
              isForbidden={isForbidden}
            />
            {countsBelowAd ? (
              role === 'faculty_role' ? (
                <WorkbenchFacultyCountsBox stacked />
              ) : (
                <WorkbenchRegionalCountsBox stacked />
              )
            ) : null}
          </div>
        );
      }
      return (
        <div className={cellClass} style={cellStyle}>
          <WorkbenchAdBox
            ads={ads}
            isLoading={isLoading}
            isError={isError}
            isForbidden={isForbidden}
          />
        </div>
      );
    }
    case 'materials':
      return <MaterialsCell className={cellClass} style={cellStyle} />;
    case 'senior_queue':
      // ردیف دوم: چهار ستون؛ ارتفاعش از ردیف (هم‌قدِ دونات) می‌آید نه از محتوای خودش.
      return (
        <div className={cn(cellClass, 'relative')}>
          <WorkbenchPendingQueueBox />
        </div>
      );
    case 'senior_donut':
      // `self-start`: برخلاف صف (که کل ردیف را پر می‌کند)، این باکس کوتاه‌است و
      // نباید کش بیاید تا هم‌قد صف/ستون چپ شود — به‌اندازهٔ محتوای خودش می‌ایستد.
      return (
        <div className={cn(cellClass, 'md:self-start')}>
          <WorkbenchApprovalsDonutBox className="w-full max-w-none" />
        </div>
      );
    case 'senior_weak_ranking':
      // سازمان مرکزی: سلول کنار اطلاعیه‌ها.
      return (
        <div className={cellClass}>
          <WorkbenchWeakRankingBox />
        </div>
      );
    case 'senior_org_counts':
      // ساخت حساب (فقط مدیر ارشد، نه دستیار) اولین باکسِ ستون چپ؛
      // درست زیرش نوار شاخص‌های ساختار سازمانی.
      return (
        <div className={cn(cellClass, 'flex flex-col gap-kv-group')}>
          {role === 'super_admin' ? <WorkbenchCreateOrgPanelLink /> : null}
          <WorkbenchOrgStructureCountsBox />
        </div>
      );
    case 'senior_role_counts':
      // تعداد نقش‌ها؛ درست زیرِ ساختار سازمانی.
      return (
        <div className={cellClass}>
          <WorkbenchRoleUserCountsBox className="min-h-[20rem]" />
        </div>
      );
    case 'senior_report_access':
      // `max-w-none`: باکس پیش‌فرض `max-w-md` دارد؛ در سلول ۶ستونه باید کل عرض را بگیرد.
      return (
        <div className={cellClass}>
          <WorkbenchReportAccessBox className="max-w-none" />
        </div>
      );
    case 'senior_published':
      return (
        <div className={cellClass}>
          <WorkbenchPublishedAnnouncementsBox role={role} />
        </div>
      );
    case 'regional_counts':
      // بدون تبلیغ: نمره بالای آمار. با تبلیغ هر دو داخل سلول `ad`اند.
      return (
        <div
          className={cn(cellClass, 'flex min-h-0 flex-col gap-kv-group')}
          style={cellStyle}
        >
          <WorkbenchStudentGradesCard role={role} compact />
          {role === 'faculty_role' ? (
            <WorkbenchFacultyCountsBox stacked={inAdTrack} />
          ) : (
            <WorkbenchRegionalCountsBox stacked={inAdTrack} />
          )}
        </div>
      );
    case 'regional_gender':
      // هم‌قدِ اطلاعیه‌ها: سلول کش می‌آید و باکس کل ارتفاعش را می‌گیرد؛ ارتفاع ردیف از همین باکس است.
      return (
        <div className={cellClass}>
          {role === 'faculty_role' ? (
            <WorkbenchFacultyResponseRateBox className="h-full w-full max-w-none" />
          ) : (
            <WorkbenchRegionalGenderBox className="h-full w-full max-w-none" />
          )}
        </div>
      );
    case 'regional_teacher_ranking':
      // دانشکده: اساتید بر اساس حضور؛ منطقه / مدیر مدرسه: معلمان بر اساس پاسخ.
      return role === 'faculty_role' ? (
        <WorkbenchProfessorAttendanceRankingBox
          role={role}
          className={cellClass}
          style={cellStyle}
        />
      ) : (
        <WorkbenchTeacherResponseRankingBox
          role={role}
          className={cellClass}
          style={cellStyle}
        />
      );
    case 'regional_school_ranking':
      // دانشکده: نمودار اساتید (میانگین نمره)؛ منطقه: نمودار مدارس.
      return role === 'faculty_role' ? (
        <WorkbenchProfessorScoreRankingBox
          role={role}
          className={cellClass}
          style={cellStyle}
        />
      ) : (
        <WorkbenchSchoolRankingBox
          role={role}
          className={cellClass}
          style={cellStyle}
        />
      );
    case 'learner_counts':
      return (
        <WorkbenchLearnerCountsBox
          role={role}
          stacked={inAdTrack}
          className={cellClass}
          style={cellStyle}
        />
      );
    case 'teacher_count':
      return (
        <WorkbenchTeacherCountBox
          role={role}
          className={cn(cellClass, 'overflow-hidden')}
          style={cellStyle}
        />
      );
    case 'course_averages':
      // «در حال بررسی» + نمودار میانگین یک سلول مستقل‌اند: کارت‌ها بالا، نمودار درست
      // زیرشان و پرکنندهٔ باقی ارتفاع.
      if (slot.includes?.includes('course_pending_reports')) {
        return (
          <div
            className={cn(cellClass, 'flex min-h-0 flex-col gap-kv-group')}
            style={cellStyle}
          >
            <WorkbenchCoursePendingReportsBox
              role={role}
              className="shrink-0"
              style={WORKBENCH_LEARNER_ANNOUNCEMENTS_STYLE}
            />
            <DashboardCourseAveragesChart
              role={role}
              className="flex min-h-0 flex-1 flex-col"
            />
          </div>
        );
      }
      return (
        <DashboardCourseAveragesChart
          role={role}
          className={cellClass}
          style={cellStyle}
        />
      );
    case 'course_pending_reports':
      return (
        <WorkbenchCoursePendingReportsBox
          role={role}
          className={cellClass}
          style={cellStyle}
        />
      );
    case 'student_grade_ranking':
      // مدیر مدرسه: به‌جای فراگیران، ضعیف‌ترین/قوی‌ترین معلمان مدرسه (نرخ پاسخ‌دهی).
      if (role === 'school_principal') {
        return (
          <WorkbenchTeacherResponseRankingBox
            role={role}
            className={cellClass}
            style={cellStyle}
          />
        );
      }
      return (
        <WorkbenchStudentGradeRankingBox
          role={role}
          className={cellClass}
          style={cellStyle}
        />
      );
    case 'course_capacities':
      // قبلاً نمودار حلقه‌ای هر درس (WorkbenchCourseCapacitiesBox)؛ حذف شد،
      // به‌جایش باکس میله‌ای سبک‌تر: فقط تعداد دانشجو (ترمی) / مهارت‌آموز (پودمانی).
      // با تبلیغ، کارت نمرات بالای خودِ تبلیغ است (سلول `ad`).
      return (
        <WorkbenchLearnerTypeCountsBox
          className={cn(cellClass, 'self-start')}
          style={cellStyle}
        />
      );
    case 'student_grades_card':
      return (
        <WorkbenchStudentGradesCard
          role={role}
          className={cellClass}
          style={cellStyle}
        />
      );
    case 'checklist':
    case 'learner_grades':
      return null;
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

export function workbenchBoardShowsAd(role: UserRole): boolean {
  return hasAdSpot(role);
}
