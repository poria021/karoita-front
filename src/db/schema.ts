import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import type { CustomScopes, DocStatus, SpecialPermissions } from "@/types";

/* -------------------------------------------------------------------------- */
/*                       Organizational structure tables                    */
/*        (mirrors `Province` / `District` / `Faculty` / `School` from      */
/*         `src/types`, seeded from the legacy Alpine org structure)        */
/* -------------------------------------------------------------------------- */

/** Top-level geographic province (استان) - the root of the org hierarchy. */
export const provinces = pgTable("provinces", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 150 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

/** Educational district/region (ناحیه/منطقه), grouping schools within a province. */
export const districts = pgTable("districts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 150 }).notNull(),
  provinceId: integer("province_id")
    .notNull()
    .references(() => provinces.id, { onDelete: "restrict" }),
  isActive: boolean("is_active").notNull().default(true),
});

/** University college/campus (پردیس), aka "faculty", supervising `student` interns. */
export const colleges = pgTable("colleges", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 150 }).notNull(),
  provinceId: integer("province_id")
    .notNull()
    .references(() => provinces.id, { onDelete: "restrict" }),
  isActive: boolean("is_active").notNull().default(true),
});

/** Host school where `skill_learner` trainees complete their internship. */
export const schools = pgTable("schools", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 150 }).notNull(),
  provinceId: integer("province_id")
    .notNull()
    .references(() => provinces.id, { onDelete: "restrict" }),
  districtId: integer("district_id")
    .notNull()
    .references(() => districts.id, { onDelete: "restrict" }),
  isActive: boolean("is_active").notNull().default(true),
});

/* -------------------------------------------------------------------------- */
/*                    better-auth core `user` table (extended)              */
/* -------------------------------------------------------------------------- */

export const user = pgTable("user", {
  // --- better-auth core columns - required as-is by `drizzleAdapter`/plugins,
  // see `src/lib/auth.ts`. Do not rename or remove these. ---
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),

  // TODO (Better-Auth Migration): `role`/`banned`/`banReason`/`banExpires` are
  // owned by better-auth's `admin` plugin (see `admin()` in `src/lib/auth.ts`)
  // and only ever hold plugin-level values ("user" | "admin"). Do NOT store the
  // Karvita business role here - it lives in `appRole` below to avoid the two
  // systems colliding.
  role: text("role"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),

  // --- Karvita domain extensions -------------------------------------------
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  // TODO (Better-Auth Migration): better-auth's primary identifier is `email`;
  // `mobile` is kept as a unique secondary contact field carried over from the
  // legacy Alpine prototype (where it was the login identifier).
  mobile: varchar("mobile", { length: 20 }).unique(),

  /**
   * Karvita business role (`UserRole` from `src/types`), e.g. `student`,
   * `mentor_teacher`, `school_principal`. Intentionally named `appRole` -
   * see the TODO on the core `role` column above for why.
   */
  appRole: varchar("app_role", { length: 32 }),

  /** Identity-verification document review status (`DocStatus` from `src/types`). */
  docStatus: varchar("doc_status", { length: 32 })
    .$type<DocStatus>()
    .default("not_submitted"),

  /** Whether a `super_admin` has approved this account for platform use. */
  isApproved: boolean("is_approved").notNull().default(false),

  // --- Organizational placement (real FKs into the org tables above) -------
  provinceId: integer("province_id").references(() => provinces.id, {
    onDelete: "set null",
  }),
  collegeId: integer("college_id").references(() => colleges.id, {
    onDelete: "set null",
  }),
  districtId: integer("district_id").references(() => districts.id, {
    onDelete: "set null",
  }),
  schoolId: integer("school_id").references(() => schools.id, {
    onDelete: "set null",
  }),

  // --- Role-specific business identifiers (free-form codes, not FKs) -------
  /** Populated for `student` role. */
  studentId: varchar("student_id", { length: 50 }),
  /** Populated for `skill_learner` role. */
  skillCode: varchar("skill_code", { length: 50 }),
  /** Populated for `supervisor_professor` role. */
  professorCode: varchar("professor_code", { length: 50 }),
  /** Populated for `mentor_teacher` / `school_principal` roles. */
  personalCode: varchar("personal_code", { length: 50 }),

  // --- RBAC overrides (see `CustomScopes` / `SpecialPermissions` in `src/types`) ---
  customScopes: jsonb("custom_scopes").$type<CustomScopes>(),
  specialPermissions: jsonb("special_permissions").$type<SpecialPermissions>(),
  /** Report type IDs this user is explicitly allowed to view (empty/null = all). */
  allowedReportTypes: jsonb("allowed_report_types").$type<string[]>(),
});

/* -------------------------------------------------------------------------- */
/*                 better-auth core tables (unchanged)                      */
/* -------------------------------------------------------------------------- */

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});
