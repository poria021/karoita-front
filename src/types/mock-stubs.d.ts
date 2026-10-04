/**
 * Ambient module declarations برای mock directories.
 * وقتی mock فایل‌ها از پروژه حذف شوند، TypeScript به‌جای «module not found»
 * از این declarations استفاده می‌کند — هر import از mock را `any` می‌داند.
 * وقتی فایل واقعی وجود داشته باشد، TypeScript همان فایل را ترجیح می‌دهد (این declarations فقط fallback هستند).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type _MockStub = Record<string, any>;

declare module '@/services/auth/mock/*' {
  const stub: _MockStub;
  export = stub;
}

declare module '@/services/mock/*' {
  const stub: _MockStub;
  export = stub;
}

declare module '@/services/daily-approvals/mock/*' {
  const stub: _MockStub;
  export = stub;
}

declare module '@/services/syllabus-config/mock/*' {
  const stub: _MockStub;
  export = stub;
}

declare module '@/services/admin-user-creation/mock/*' {
  const stub: _MockStub;
  export = stub;
}

declare module '@/services/internship-enrollment/mock/*' {
  const stub: _MockStub;
  export = stub;
}

declare module '@/services/landing-cms/mock/*' {
  const stub: _MockStub;
  export = stub;
}

declare module '@/services/notifications/mock/*' {
  const stub: _MockStub;
  export = stub;
}

declare module '@/services/onboarding-approvals/mock/*' {
  const stub: _MockStub;
  export = stub;
}

declare module '@/services/org-structure/mock/*' {
  const stub: _MockStub;
  export = stub;
}

declare module '@/services/organizational-capacities/mock/*' {
  const stub: _MockStub;
  export = stub;
}

declare module '@/services/profile/mock/*' {
  const stub: _MockStub;
  export = stub;
}

