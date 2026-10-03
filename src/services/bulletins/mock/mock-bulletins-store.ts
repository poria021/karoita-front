import { isMockApiMode } from '@/lib/api-mode';
import { assertMockSimulator, MOCK_AUTHZ_DENIED } from '@/services/mock/mock-authz';
import { useUserStore } from '@/store/useUserStore';
import type { Bulletin, BulletinAuthor } from '@/types/bulletins';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

const STORAGE_KEY = 'karvita_mock_bulletins_v1';

export const BULLETINS_STORAGE_QUOTA_ERROR =
  'حجم تصاویر تبلیغات زیاد است و در حافظهٔ مرورگر ذخیره نشد. تصویر کوچک‌تری انتخاب کنید یا تبلیغ قدیمی را حذف کنید.';

let memory: Bulletin[] | null = null;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

const SEED_FULL_AUDIENCE: Bulletin['audienceRoles'] = [
  'provincial_university',
  'faculty_role',
  'regional_edu_admin',
  'school_principal',
  'supervisor_professor',
  'mentor_teacher',
  'student',
  'skill_learner',
];

function buildSeed(): Bulletin[] {
  const now = Date.now();
  const at = (hoursAgo: number) =>
    new Date(now - hoursAgo * 3_600_000).toISOString();
  return [
    {
      id: 'bul_seed_ad_1',
      kind: 'advertisement',
      title: 'وبینار آشنایی با سامانهٔ کارویتا',
      body: 'وبینار آموزشی کار با ماژول‌های گزارش روزانه و ارزیابی، ویژهٔ همهٔ کاربران سامانه.',
      authorRole: 'super_admin',
      authorName: 'مدیر ارشد',
      audienceRoles: ['central_organization', ...SEED_FULL_AUDIENCE],
      createdAt: at(30),
      updatedAt: at(30),
    },
    {
      id: 'bul_seed_ann_1',
      kind: 'announcement',
      title: 'آغاز ثبت گزارش‌های روزانهٔ ترم جدید',
      body: 'ثبت گزارش روزانهٔ کارورزی و کارآموزی از ابتدای هفتهٔ آینده فعال می‌شود. لطفاً پروفایل خود را تکمیل کنید.',
      authorRole: 'central_organization',
      authorName: 'سازمان مرکزی',
      audienceRoles: [...SEED_FULL_AUDIENCE],
      createdAt: at(6),
      updatedAt: at(6),
    },
  ];
}

function persist(rows: Bulletin[]): void {
  if (!isBrowser() || !isMockApiMode()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    throw new Error(BULLETINS_STORAGE_QUOTA_ERROR);
  }
}

export function readMockBulletins(): Bulletin[] {
  if (memory) return structuredClone(memory);
  if (isBrowser() && isMockApiMode()) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          memory = parsed as Bulletin[];
          return structuredClone(memory);
        }
      }
    } catch {
      // دادهٔ خراب → seed
    }
  }
  memory = buildSeed();
  return structuredClone(memory);
}

export function mutateMockBulletins(
  mutator: (draft: Bulletin[]) => Bulletin[] | void
): Bulletin[] {
  const draft = readMockBulletins();
  const next = mutator(draft) ?? draft;
  persist(next);
  memory = structuredClone(next);
  return structuredClone(memory);
}

export function resetMockBulletinsForTests(rows?: Bulletin[] | null): void {
  memory = rows ? structuredClone(rows) : null;
}

/** نویسندهٔ mock از نشست فعال — در real، Nest از توکن تشخیص می‌دهد. */
export function mockSessionAuthor(): BulletinAuthor {
  assertMockSimulator();
  const user = useUserStore.getState().activeUser;
  if (!user) throw new Error(MOCK_AUTHZ_DENIED);
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    getRoleStrategy(user.role).label;
  return { role: user.role, name };
}
