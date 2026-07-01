// Global domain entities for the Karvita internship/mentorship platform.
//
// These types are extracted 1:1 from the legacy Alpine.js prototype's
// in-memory `db` shape (`db.users`, `db.internships`, `db.orgStructure`, ...)
// so that the migration to Next.js preserves the exact business rules while
// gaining compile-time safety. Domain-specific types that are NOT shared
// globally should live next to their feature under `src/features/*` instead
// of being added here.

/* -------------------------------------------------------------------------- */
/*                            Role & Enum Types                             */
/* -------------------------------------------------------------------------- */

/**
 * Every role recognized by the RBAC system.
 *
 * - `student` - university student completing a theoretical internship (کارورزی).
 * - `skill_learner` - trainee completing a skill-based internship (کارآموزی مهارتی).
 * - `supervisor_professor` - university professor supervising `student` interns.
 * - `mentor_teacher` - in-school mentor teacher supervising trainees day-to-day.
 * - `school_principal` - principal of the host school, signs off on final grading.
 * - `super_admin` - platform administrator with full, unscoped access.
 */
export type UserRole =
  | "student"
  | "skill_learner"
  | "supervisor_professor"
  | "mentor_teacher"
  | "school_principal"
  | "super_admin";

/**
 * Lifecycle of a user's identity-verification document review, as tracked by
 * `super_admin` approvals in the legacy prototype.
 *
 * - `not_submitted` - the user has not uploaded an identity document yet.
 * - `pending_admin` - submitted and awaiting `super_admin` review.
 * - `approved` - reviewed and accepted; the user account is fully active.
 * - `rejected` - reviewed and rejected; the user must resubmit.
 */
export type DocStatus =
  | "not_submitted"
  | "pending_admin"
  | "approved"
  | "rejected";

/**
 * Overall lifecycle status of an {@link InternshipCourse} enrollment.
 *
 * - `ongoing` - actively in progress for the current academic term.
 * - `completed` - finished and graded.
 * - `dropped` - withdrawn/removed before completion (see `removalPending`).
 * - `not_started` - enrolled but the term/course has not begun yet.
 */
export type CourseStatus = "ongoing" | "completed" | "dropped" | "not_started";

/**
 * Review/grading state of a single {@link WeekReport} entry.
 *
 * - `draft` - the trainee is still writing the report, not yet submitted.
 * - `pending` - submitted and awaiting advisor/mentor review.
 * - `needs_edit` - sent back to the trainee for revisions.
 * - `approved` - accepted by the reviewer(s), ready to be graded.
 * - `graded` - a final score has been recorded for this week.
 */
export type WeekState = "draft" | "pending" | "needs_edit" | "approved" | "graded";

/**
 * Whether a scheduled week column is currently open for submissions.
 *
 * - `active` - visible and editable by the trainee.
 * - `archived` - locked/read-only, kept for historical record only.
 */
export type WeekStatus = "active" | "archived";

/* -------------------------------------------------------------------------- */
/*                         Core Domain Interfaces                           */
/* -------------------------------------------------------------------------- */

/**
 * Fine-grained, opt-in geographic/organizational scoping applied to a user
 * whose default role-based scope has been customized by a `super_admin`.
 *
 * Each property holds an array of entity names (mirroring the legacy
 * prototype's use of plain strings rather than foreign IDs) that the user is
 * additionally restricted or granted access to. An empty/undefined array
 * means "no custom scope for this dimension" and the user's default,
 * role-derived scope applies instead.
 */
export interface CustomScopes {
  /** Province names this user is explicitly scoped to. */
  provinces?: string[];
  /** College/faculty (پردیس) names this user is explicitly scoped to. */
  colleges?: string[];
  /** District (ناحیه/منطقه) names this user is explicitly scoped to. */
  districts?: string[];
  /** School names this user is explicitly scoped to. */
  schools?: string[];
}

/**
 * Discrete, boolean feature flags that grant a user capabilities beyond what
 * their {@link UserRole} normally allows. Layered on top of the role +
 * {@link CustomScopes} system for one-off elevated permissions.
 */
export interface SpecialPermissions {
  /** User can view data but cannot create/edit/delete anything. */
  readOnly: boolean;
  /** User can access records outside their own college/faculty. */
  crossFaculty: boolean;
  /** User can manage platform-wide announcements/ads. */
  manageAds: boolean;
  /** User can access management-level aggregate reports. */
  managementReports: boolean;
}

/**
 * A single platform user/account, modeled after the legacy prototype's
 * `db.users[]` records (see `buildMockUserRecord` / `seedMockUsers`).
 *
 * This is intentionally a "wide" interface: since every {@link UserRole}
 * reuses the same table in the legacy prototype, role-specific fields are
 * optional here and only populated for the roles that use them (e.g.
 * `studentId` for students, `skillCode` for skill learners).
 */
export interface User {
  // TODO (better-auth sync): map to better-auth's `user.id` (string, not numeric)
  // once accounts are created through better-auth instead of the mock seeder.
  id: string;

  firstName: string;
  lastName: string;

  // TODO (better-auth sync): better-auth's core `user` schema uses `email` as
  // the primary identifier; this legacy field predates that and should be
  // reconciled (kept as a secondary contact field, or migrated to metadata).
  mobile: string;

  // TODO (better-auth sync): credentials are owned by better-auth's
  // account/session tables. `password`/`hasPassword` must NOT be persisted
  // on the application `User` record going forward - drop once auth is wired.
  password?: string;
  hasPassword?: boolean;

  role: UserRole;

  /** Whether a `super_admin` has approved this account for platform use. */
  approved: boolean;

  /** Identity-verification document review status. */
  docStatus: DocStatus;

  /** Custom RBAC scope override, when different from the role's default scope. */
  customScopes?: CustomScopes;

  /** One-off elevated capabilities granted independently of `role`. */
  specialPermissions?: SpecialPermissions;

  /** Report type IDs this user is explicitly allowed to view (empty = all). */
  allowedReportTypes?: string[];

  // --- Organizational placement (denormalized names, mirroring legacy data) ---
  province?: string;
  district?: string;
  school?: string;
  college?: string;

  // --- Role-specific identifiers ---
  /** Populated for `student` role. */
  studentId?: string;
  /** Populated for `skill_learner` role. */
  skillCode?: string;
  /** Populated for `supervisor_professor` role. */
  professorCode?: string;
  /** Populated for `mentor_teacher` / `school_principal` roles. */
  personalCode?: string;

  /** Field of study / major, e.g. "آموزش ابتدایی". */
  major?: string;

  /** Free-text message attached to an approval/access request. */
  adminRequestMessage?: string;

  // TODO (better-auth sync): replace with better-auth's `createdAt` (Date)
  // once records are created through better-auth instead of the mock seeder.
  regDate?: string;
  /** Epoch ms of record creation, used for sorting/seeding purposes. */
  timestamp?: number;
  /** Epoch ms of the last mutation, used for optimistic-sync conflict checks. */
  lastChange?: number;
}

/* -------------------------------------------------------------------------- */
/*                    Academic / Mentorship Interfaces                      */
/* -------------------------------------------------------------------------- */

/**
 * A file attached to a {@link WeekReport} submission.
 */
export interface WeekReportFile {
  /** Original file name as uploaded by the trainee. */
  name: string;
  /** File size in megabytes (already converted from bytes at upload time). */
  size: number;
}

/**
 * Structured feedback left on a {@link WeekReport} by each reviewer role.
 * All fields are optional since a report may not have been reviewed by
 * every role yet.
 */
export interface WeekReportFeedback {
  /** Free-text (HTML) feedback left by the supervising professor/advisor. */
  advisor?: string;
  /** Free-text feedback left by the in-school mentor teacher. */
  mentor?: string;
  /** Mentor's qualitative rating for the week (e.g. "خیلی خوب", "عالی"). */
  mentor_rating?: string;
  /** Free-text feedback left by the school principal. */
  principal?: string;
  /** Principal's qualitative/numeric rating for the week. */
  principal_rating?: string;
}

/**
 * A single week's report/submission within an {@link InternshipCourse},
 * corresponding to one column of the trainee's weekly report grid.
 */
export interface WeekReport {
  /** 1-based sequential week number within the course. */
  id: number;
  /** Display title/label for the week column, e.g. "هفته اول". */
  title: string;
  /** Optional short suffix/label used interchangeably with `title` in the UI. */
  suffix?: string;
  /** Relative grading weight of this week versus the others in the course. */
  weight: number;
  /** Whether this week column is open for edits or locked/archived. */
  status: WeekStatus;
  /** Review/grading progress of this specific week's submission. */
  state: WeekState;
  /** Final numeric score for the week, `null` until graded. */
  score: number | null;
  /** The trainee's free-text report body for this week. */
  text: string;
  /** Attachments uploaded alongside the report text. */
  files: WeekReportFile[];
  /** Reviewer feedback, keyed by reviewer role. */
  feedback: WeekReportFeedback;
}

/**
 * A trainee's enrollment in an internship/apprenticeship course for a given
 * academic term, mirroring `db.internships[]` in the legacy prototype.
 */
export interface InternshipCourse {
  /** Unique enrollment/course record identifier. */
  id: string;
  studentId: string;
  studentName: string;
  /** Course title, e.g. "کارورزی ۱" or "کارآموزی مهارتی ۱". */
  title: string;
  status: CourseStatus;
  /** Final numeric grade, `null` while still `ongoing`/ungraded. */
  grade: number | null;
  supervisorId: string | null;
  supervisorName: string;
  mentorId: string | null;
  mentorName: string;
  schoolName: string;
  hoursCompleted: number;
  totalHours: number;
  /**
   * `true` when a removal request has been submitted for admin review but not
   * yet finalized - the course stays visible but the trainee's cartable is
   * locked to read-only/archive mode in the meantime.
   */
  removalPending: boolean;
  /** Ordered list of weekly report entries for this course. */
  weeks: WeekReport[];
}

/* -------------------------------------------------------------------------- */
/*                    Organizational Structure Interfaces                   */
/* -------------------------------------------------------------------------- */

/**
 * A top-level geographic province (استان), the root of the org hierarchy.
 */
export interface Province {
  id: number;
  name: string;
}

/**
 * A university college/campus (پردیس) that supervises `student` interns.
 * Belongs to exactly one {@link Province}.
 */
export interface Faculty {
  id: number;
  name: string;
  /** Foreign key referencing {@link Province.id}. */
  provinceId: number;
}

/**
 * An educational district/region (ناحیه/منطقه) that groups schools within a
 * province.
 */
export interface District {
  id: number;
  name: string;
  /** Foreign key referencing {@link Province.id}. */
  provinceId: number;
}

/**
 * A host school where `skill_learner` trainees complete their internship,
 * mentored on-site by a `mentor_teacher` and signed off by a
 * `school_principal`.
 */
export interface School {
  id: number;
  name: string;
  /** Foreign key referencing {@link District.id}. */
  districtId: number;
  /** Foreign key referencing {@link Province.id}. */
  provinceId: number;
}
