/** seed کامل سرور جعلی: داده‌ی پایه + ماژول ثبت‌نام (جدا تا import حلقه‌ای نشود). */
import type { TermLessonsMode } from './handlers/syllabus';
import { seedStore } from './seed';
import { seedAdvertisementModule } from './seed-advertisements';
import { seedEnrollmentModule } from './seed-enrollments';
import type { Store } from './store';

export function seedAll(store: Store, termLessons: TermLessonsMode): void {
  seedStore(store, termLessons);
  seedEnrollmentModule(store);
  seedAdvertisementModule(store);
}
