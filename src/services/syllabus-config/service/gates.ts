import { isMockApiMode } from '@/lib/api-mode';
import { assertMockClientHasPermission } from '@/services/mock/mock-authz';

export function gateSyllabus(): void {
  if (isMockApiMode()) {
    assertMockClientHasPermission('syllabus.manage');
  }
}

export function gateSyllabusTermSettings(): void {
  if (isMockApiMode()) {
    assertMockClientHasPermission('syllabus.term-settings');
  }
}

/** خوانندهٔ ثبت‌نام/تأیید روزانه — در real، `Nest` خودش authz می‌کند. */
export function gateSyllabusConsumerRead(): void {
  if (isMockApiMode()) {
    // مسیر فقط-خواندنی mock گارد `syllabus.manage` نمی‌خواهد
  }
}
