import type { DocStatus } from '@/types/auth';

/**
 * بعد از ارسال پرونده، هویت/مدرک تا تعیین وضعیت قفل است.
 * بعد از تأیید حساب، فیلدهای سازمانی باز می‌مانند تا کاربر بتواند
 * بدون برگشت به صف مدیر ارشد آن‌ها را ذخیره کند.
 */
export function getProfileFormLocks(input: {
  disabled: boolean;
  autoApproveOnSave: boolean;
  docStatus: DocStatus;
  /** بعد از تأیید حساب، دکمه فقط وقتی فیلدی عوض شده باز است. */
  hasUnsavedChanges?: boolean;
}): {
  awaitingAdminReview: boolean;
  accountApproved: boolean;
  identityLocked: boolean;
  organizationLocked: boolean;
  submitLocked: boolean;
} {
  const awaitingAdminReview =
    !input.autoApproveOnSave && input.docStatus === 'pending_admin';
  const accountApproved =
    !input.autoApproveOnSave && input.docStatus === 'approved';
  const hasUnsavedChanges = input.hasUnsavedChanges ?? false;

  return {
    awaitingAdminReview,
    accountApproved,
    identityLocked: input.disabled || awaitingAdminReview || accountApproved,
    organizationLocked: input.disabled || awaitingAdminReview,
    submitLocked:
      input.disabled ||
      awaitingAdminReview ||
      (accountApproved && !hasUnsavedChanges),
  };
}
