import { isMockApiMode } from '@/lib/api-mode';
import { assertMockSimulator, MOCK_AUTHZ_DENIED } from '@/services/mock/mock-authz';
import { useUserStore } from '@/store/useUserStore';
import type {
  CourseMaterial,
  CourseMaterialAuthor,
} from '@/types/course-materials';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

const STORAGE_KEY = 'karvita_mock_course_materials_v1';

export const COURSE_MATERIALS_STORAGE_QUOTA_ERROR =
  'حافظهٔ مرورگر برای ذخیرهٔ فایل کافی نیست. فایل کوچک‌تری انتخاب کنید یا فایل‌های قدیمی را حذف کنید.';

let memory: CourseMaterial[] | null = null;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function persist(rows: CourseMaterial[]): void {
  if (!isBrowser() || !isMockApiMode()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    throw new Error(COURSE_MATERIALS_STORAGE_QUOTA_ERROR);
  }
}

export function readMockCourseMaterials(): CourseMaterial[] {
  if (memory) return structuredClone(memory);
  if (isBrowser() && isMockApiMode()) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) {
        memory = parsed as CourseMaterial[];
        return structuredClone(memory);
      }
    } catch {
      // دادهٔ خراب → خالی
    }
  }
  memory = [];
  return [];
}

export function mutateMockCourseMaterials(
  mutator: (draft: CourseMaterial[]) => CourseMaterial[] | void
): CourseMaterial[] {
  const draft = readMockCourseMaterials();
  const next = mutator(draft) ?? draft;
  persist(next);
  memory = structuredClone(next);
  return structuredClone(memory);
}

export function resetMockCourseMaterialsForTests(
  rows?: CourseMaterial[] | null
): void {
  memory = rows ? structuredClone(rows) : null;
}

/** نویسندهٔ mock از نشست فعال — در real، Nest از توکن تشخیص می‌دهد. */
export function mockSessionAuthor(): CourseMaterialAuthor {
  assertMockSimulator();
  const user = useUserStore.getState().activeUser;
  if (!user) throw new Error(MOCK_AUTHZ_DENIED);
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    getRoleStrategy(user.role).label;
  return { id: user.id, role: user.role, name };
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('خواندن فایل ناموفق بود.'));
    reader.readAsDataURL(file);
  });
}
