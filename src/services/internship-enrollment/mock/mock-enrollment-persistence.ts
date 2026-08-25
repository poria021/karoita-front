import { isMockApiMode } from '@/lib/api-mode';
import type {
  InternshipEnrollmentRecord,
  InternshipWeeklyReportFeedback,
  InternshipWeeklyReportFile,
  InternshipWeeklySessionState,
} from '@/types/internship-enrollment';

const STORAGE_KEY = 'karvita_mock_internship_enrollments_v1';

export type WeekReportOverride = {
  text: string;
  files: InternshipWeeklyReportFile[];
  status: Extract<
    InternshipWeeklySessionState,
    'draft' | 'pending' | 'needs_edit'
  >;
  feedback?: InternshipWeeklyReportFeedback;
};

export type EnrollmentSnapshot = {
  records: InternshipEnrollmentRecord[];
  confirmedCapacity: Record<string, number>;
  weekReports: Record<string, WeekReportOverride>;
};

let memorySnapshot: EnrollmentSnapshot | null = null;

export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function emptySnapshot(): EnrollmentSnapshot {
  return { records: [], confirmedCapacity: {}, weekReports: {} };
}

export function readSnapshot(): EnrollmentSnapshot {
  if (memorySnapshot) {
    memorySnapshot = {
      records: memorySnapshot.records ?? [],
      confirmedCapacity: memorySnapshot.confirmedCapacity ?? {},
      weekReports: memorySnapshot.weekReports ?? {},
    };
    return memorySnapshot;
  }

  if (isBrowser() && isMockApiMode()) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<EnrollmentSnapshot>;
        memorySnapshot = {
          records: parsed.records ?? [],
          confirmedCapacity: parsed.confirmedCapacity ?? {},
          weekReports: parsed.weekReports ?? {},
        };
        return memorySnapshot;
      }
    } catch {
      // A damaged mock value must not prevent the enrollment route from loading.
    }
  }

  memorySnapshot = emptySnapshot();
  return memorySnapshot;
}

export function writeSnapshot(snapshot: EnrollmentSnapshot): EnrollmentSnapshot {
  memorySnapshot = structuredClone(snapshot);
  if (isBrowser() && isMockApiMode()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memorySnapshot));
  }
  return memorySnapshot;
}

/** Test helper — replace or clear enrollment mock persistence. */
export function resetEnrollmentSnapshotForTests(
  snapshot?: EnrollmentSnapshot | null
): void {
  memorySnapshot = snapshot ? structuredClone(snapshot) : null;
  // همچنین localStorage رو پاک می‌کنیم تا بین تست‌ها data leak نشه
  if (isBrowser()) {
    try {
      if (snapshot == null) {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memorySnapshot));
      }
    } catch {
      // noop — در محیط تست ممکنه localStorage محدود باشه
    }
  }
}
