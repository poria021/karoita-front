import {
  GraduationCap,
  School,
  ShieldCheck,
  UserCheck,
  UsersRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/types";

/**
 * Strategy Pattern for role-dependent UI/navigation behavior.
 *
 * Rather than scattering `if (role === "...")` / `switch (role)` branches
 * across components to decide a user's display name, badge, icon, initial
 * redirect, or accessible modules, every role's behavior is declared once
 * here as a small "strategy" object. Call sites simply look up
 * `roleStrategyMap[role]` (or use {@link getRoleStrategy}) and read the
 * fields they need - adding a new role only means adding one new entry to
 * this map, with zero changes required at any call site.
 *
 * Module/badge/icon groupings below are ported directly from the legacy
 * Alpine prototype's `roles` config object (`karvita.html`).
 */

/**
 * Opaque business-module identifier a role is allowed to access, flattened
 * from the legacy Alpine sidebar's (possibly nested/dropdown) menu tree down
 * to each leaf item's `id`. These are NOT route segments - feature code
 * (under `src/features/*`) is expected to interpret them to decide what to
 * render/enable.
 */
export type ModuleKey = string;

export interface RoleStrategyConfig {
  /** Localized display name for the role, e.g. "دانشجو". */
  name: string;
  /** Short descriptive badge shown next to the role, e.g. "آموزش علمی نظری". */
  badge: string;
  /** `lucide-react` icon component representing the role in the UI. */
  icon: LucideIcon;
  /**
   * Initial route to send the user to right after login.
   *
   * TODO (Auth Refactor): currently points at the generic `/dashboard` or
   * `/admin` routes that already exist in `src/app`. Once role-specific
   * sub-routes are added under the `(dashboard)` route group (see
   * `src/app/(dashboard)/layout.tsx`), update these to the dedicated path
   * per role (e.g. `/overview/student`, `/overview/mentor`, ...).
   */
  redirectPath: string;
  /** Business modules this role can access, keyed by {@link ModuleKey}. */
  modules: ModuleKey[];
}

export const roleStrategyMap: Record<UserRole, RoleStrategyConfig> = {
  student: {
    name: "دانشجو",
    badge: "آموزش علمی نظری",
    icon: GraduationCap,
    redirectPath: "/dashboard",
    modules: ["internship_selection"],
  },
  skill_learner: {
    name: "مهارت‌آموز",
    badge: "آموزش فنی و کارگاهی",
    icon: Wrench,
    redirectPath: "/dashboard",
    modules: ["internship_selection"],
  },
  supervisor_professor: {
    name: "استاد راهنما",
    badge: "ارزیاب علمی دانشگاه",
    icon: UserCheck,
    redirectPath: "/dashboard",
    modules: ["trainee_reports_grading", "organizational_capacities"],
  },
  mentor_teacher: {
    name: "معلم راهنما",
    badge: "ناظر و هدایت‌گر مدرسه",
    icon: UsersRound,
    redirectPath: "/dashboard",
    modules: ["trainee_reports_grading", "organizational_capacities"],
  },
  school_principal: {
    name: "مدیر مدرسه",
    badge: "مدیریت کل واحد آموزشی",
    icon: School,
    redirectPath: "/dashboard",
    modules: ["trainee_reports_grading", "organizational_capacities"],
  },
  super_admin: {
    name: "مدیر ارشد سامانه",
    badge: "مدیریت عالی و حاکمیتی",
    icon: ShieldCheck,
    // TODO (Auth Refactor): `/admin` currently redirects straight to
    // `/admin/users` (see `src/app/admin/page.tsx`); revisit once a proper
    // admin overview page exists.
    redirectPath: "/admin",
    modules: [
      "admin_onboarding_approvals",
      "user_permissions_management",
      "organizational_structure",
      "capacity_ceilings",
      "syllabus_config",
    ],
  },
};

/** Looks up the {@link RoleStrategyConfig} for a given {@link UserRole}. */
export function getRoleStrategy(role: UserRole): RoleStrategyConfig {
  return roleStrategyMap[role];
}

/** Whether `role` is allowed to access the given {@link ModuleKey}. */
export function hasModuleAccess(role: UserRole, moduleKey: ModuleKey): boolean {
  return roleStrategyMap[role].modules.includes(moduleKey);
}
