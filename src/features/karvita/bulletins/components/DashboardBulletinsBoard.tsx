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
import {
  RoleUserCountsGrid,
  WorkbenchRoleUserCountsBox,
} from '@/features/karvita/dashboard/components/WorkbenchRoleUserCountsBox';
import { buildRoleUserCountMetrics } from '@/features/karvita/dashboard/lib/role-user-counts';
import { WorkbenchTeacherCountBox } from '@/features/karvita/dashboard/components/WorkbenchTeacherCountBox';
import { WorkbenchStudentGradesCard } from '@/features/karvita/dashboard/components/WorkbenchStudentGradesCard';
import { WorkbenchWeakRankingBox } from '@/features/karvita/dashboard/components/WorkbenchWeakRankingBox';
import { useDashboardCourseMaterials } from '@/features/karvita/dashboard/hooks/useDashboardCourseMaterials';
import { cn } from '@/lib/utils';
import {
  WORKBENCH_LEARNER_ANNOUNCEMENTS_STYLE,
  WORKBENCH_RANKING_BOX_STYLE,
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

/** TEMP: داده‌ی نمایشی برای دیدن ظاهر باکس «تعداد کاربران هر نقش» در پنل سازمان مرکزی. */
const CENTRAL_PREVIEW_ROLE_METRICS = buildRoleUserCountMetrics({
  student: 1240,
  skill_learner: 386,
  supervisor_professor: 142,
  mentor_teacher: 518,
  school_principal: 97,
  regional_edu_admin: 21,
  faculty_role: 34,
  provincial_university: 12,
  central_organization: 5,
});

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
    // کارت نمرات برای نقش‌های ارزیابی (زیر تبلیغ وقتی تبلیغ هست).
    showStudentGradesCard: kind === 'evaluation',
    showRegionalCounts:
      role === 'regional_edu_admin' ||
      role === 'faculty_role' ||
      role === 'provincial_university' ||
      role === 'central_organization',
  });
  const actions = workbenchAnnouncementActionsFor(role);
  const announcementSource =
    kind === 'senior' ? 'received' : data.sources.announcement;

  return (
    <>
      {adBelowAnnouncements(slots).map((slot) => (
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

/**
 * موبایل (تک‌ستون): ترتیب DOM همان ترتیب نمایش است، پس باکس تبلیغ باید در DOM درست بعد از
 * اطلاعیه‌ها بیاید. دسکتاپ با col/row صریح چیده می‌شود و جابه‌جایی DOM اثری روی آن ندارد.
 */
function adBelowAnnouncements(slots: WorkbenchBoxSlot[]): WorkbenchBoxSlot[] {
  const ad = slots.find((slot) => slot.id === 'ad');
  const announcementsIndex = slots.findIndex(
    (slot) => slot.id === 'announcements'
  );
  if (!ad || announcementsIndex < 0) return slots;
  const rest = slots.filter((slot) => slot.id !== 'ad');
  const at = rest.findIndex((slot) => slot.id === 'announcements') + 1;
  return [...rest.slice(0, at), ad, ...rest.slice(at)];
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
    ? workbenchAdCellClass(placement, {
        // دانشجو/مهارت‌آموز و نقش‌های ارزیابی (معلم راهنما و ...): تبلیغ موبایل تمام‌عرض.
        fullWidthOnMobile:
          workbenchLayoutKindFor(role) === 'learner' ||
          workbenchLayoutKindFor(role) === 'evaluation',
      })
    : workbenchCellClass(placement);
  const cellStyle = workbenchCellStyle(placement);
  // دانشگاه استانی دقیقاً همان باکس‌های مدیر دانشکده را دارد.
  const facultyBoxes =
    role === 'faculty_role' || role === 'provincial_university';

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
      const gradesBelowAd = slot.includes?.includes('student_grades_card');
      const countsBelowAd = slot.includes?.includes('regional_counts');
      if (gradesBelowAd || countsBelowAd) {
        // تبلیغ + نمره + آمار چسبیده. overflow≠visible تا min-content
        // سلول ردیف خوش‌آمد را باد نکند؛ self-stretch ارتفاع را از باکس‌های چپ می‌گیرد.
        return (
          <div
            className={cn(
              cellClass,
              'flex min-h-0 flex-col gap-kv-group md:self-stretch md:overflow-hidden'
            )}
            style={cellStyle}
          >
            <WorkbenchAdBox
              ads={ads}
              isLoading={isLoading}
              isError={isError}
              isForbidden={isForbidden}
            />
            {gradesBelowAd ? (
              // زیر تبلیغ همیشه کوتاه (compact)، مثل پنل‌های دانشکده/منطقه — با یا بدون باکس آمار.
              <WorkbenchStudentGradesCard role={role} compact />
            ) : null}
            {countsBelowAd ? (
              facultyBoxes ? (
                <WorkbenchFacultyCountsBox role={role} stacked />
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
      // نمره بالای آمار؛ در ترک تبلیغ (ستون ۱۳) زیر خود تبلیغ، وگرنه تمام‌عرض.
      return (
        <div
          className={cn(cellClass, 'flex min-h-0 flex-col gap-kv-group')}
          style={cellStyle}
        >
          <WorkbenchStudentGradesCard role={role} compact />
          {facultyBoxes ? (
            <WorkbenchFacultyCountsBox role={role} stacked={inAdTrack} />
          ) : (
            <WorkbenchRegionalCountsBox stacked={inAdTrack} />
          )}
        </div>
      );
    case 'regional_gender':
      // هم‌قدِ اطلاعیه‌ها: سلول کش می‌آید و باکس کل ارتفاعش را می‌گیرد؛ ارتفاع ردیف از همین باکس است.
      return (
        <div className={cellClass} style={cellStyle}>
          {facultyBoxes ? (
            <WorkbenchFacultyResponseRateBox
              role={role}
              className="h-full w-full max-w-none"
            />
          ) : (
            <WorkbenchRegionalGenderBox className="h-full w-full max-w-none" />
          )}
        </div>
      );
    case 'regional_teacher_ranking':
      // سازمان مرکزی: به‌جای ضعیف‌ترین/قوی‌ترین معلمان، «تعداد کاربران هر نقش» (هم‌قد همان باکس).
      if (role === 'central_organization') {
        return (
          <div
            className={cn(cellClass, 'flex')}
            style={{ ...cellStyle, ...WORKBENCH_RANKING_BOX_STYLE }}
          >
            {/* TEMP: پیش‌نمایش با داده‌ی نمایشی؛ بعد از تأیید ظاهر، به <WorkbenchRoleUserCountsBox interactive={false} /> برگردد. */}
            <RoleUserCountsGrid
              interactive={false}
              isLoading={false}
              isError={false}
              isForbidden={false}
              metrics={CENTRAL_PREVIEW_ROLE_METRICS}
            />
          </div>
        );
      }
      // دانشکده: اساتید بر اساس حضور؛ منطقه / مدیر مدرسه: معلمان بر اساس پاسخ.
      return facultyBoxes ? (
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
      return facultyBoxes ? (
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
      // با تبلیغ، کارت نمرات زیر خودِ تبلیغ است (سلول `ad`).
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
