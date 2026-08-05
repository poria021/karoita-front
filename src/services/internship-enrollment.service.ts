import { isMockApiMode, throwRealModeNotImplemented } from '@/lib/api-mode';
import { assertMockClientHasPermission } from '@/services/mock/mock-authz';
import {
  resolveEnrollmentPageState,
} from '@/services/internship-enrollment/mock-enrollment-store';
import type {
  GetEnrollmentPageStateInput,
  InternshipEnrollmentPageState,
} from '@/types/internship-enrollment';

function gateEnrollment(): 'mock' | never {
  if (!isMockApiMode()) {
    throwRealModeNotImplemented('InternshipEnrollmentService');
  }
  assertMockClientHasPermission('internship.select');
  return 'mock';
}

/**
 * Facade انتخاب واحد کارورزی / کارآموزی (Phase 1 — gate shell).
 *
 * Nest-blocked:
 * - شاخهٔ real: fail-closed تا endpoint Nest وصل شود
 * - Phase 2+: supervisor picker, submitFinal, school/mentor, week editor, PDF
 */
export const InternshipEnrollmentService = {
  /**
   * وضعیت صفحهٔ انتخاب واحد برای نقش + سطح فعال.
   * ترم / درگاه ثبت‌نام / ترم از snapshot سرفصل خوانده می‌شود.
   */
  async getEnrollmentPageState(
    input: GetEnrollmentPageStateInput
  ): Promise<InternshipEnrollmentPageState> {
    gateEnrollment();
    return resolveEnrollmentPageState(input);
  },
};
