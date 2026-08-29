'use client';

import { useState, type FormEvent } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import {
  KvCard,
  KvCardContent,
} from '@/components/shared/KvCard';
import { KvCardTitleIcon } from '@/components/shared/KvCardTitleIcon';
import { KvMobileNumberField } from '@/components/shared/fields/KvMobileNumberField';
import { KvSelectItem } from '@/components/shared/fields/KvSelect';
import { KvSelectField } from '@/components/shared/fields/KvSelectField';
import { KvSwitch } from '@/components/shared/fields/KvSwitch';
import { KvTextField } from '@/components/shared/fields/KvTextField';
import { KvTypography } from '@/components/shared/KvTypography';
import { getOrgAccountRoleOptionsForKind } from '../constants';
import type {
  StaffAdminAccount,
  UpdateStaffAdminInput,
} from '@/types/admin-user-creation';
import { isStaffAdminRole } from '@/types/role-taxonomy';
import { faIcons } from '@/utils/iconMap';
import { formatJalaliSlashDisplay } from '@/utils/formatJalaliDate';
import { persianToEnglishDigits, toPersianDigits } from '@/utils/persianDigits';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

const STAFF_ROLE_OPTIONS = getOrgAccountRoleOptionsForKind('admin');

function statusLabel(name: string): string {
  if (name === 'active') return 'فعال';
  if (name === 'inactive' || name === 'disabled') return 'غیرفعال';
  return name || '—';
}

function createdLabel(iso: string): string {
  if (!iso.trim()) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return formatJalaliSlashDisplay(date);
}

function toFormMobile(mobile: string): string {
  const digits = persianToEnglishDigits(mobile).replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('09')) return digits.slice(1);
  return digits.slice(0, 10);
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-kv-micro">
      <KvTypography variant="overline" tone="muted" as="p">
        {label}
      </KvTypography>
      <KvTypography variant="body" as="p">
        {value}
      </KvTypography>
    </div>
  );
}

type StaffAdminDraft = {
  firstName: string;
  lastName: string;
  mobile: string;
  role: string;
  active: boolean;
};

function draftFromAdmin(admin: StaffAdminAccount): StaffAdminDraft {
  return {
    firstName: admin.firstName,
    lastName: admin.lastName,
    mobile: toFormMobile(admin.mobile),
    role: isStaffAdminRole(admin.role) ? admin.role : 'assistant_admin',
    active: admin.statusName === 'active',
  };
}

type FieldErrors = Partial<Record<keyof StaffAdminDraft, string>>;

function validateDraft(draft: StaffAdminDraft): FieldErrors {
  const errors: FieldErrors = {};
  if (!draft.firstName.trim()) errors.firstName = 'نام الزامی است.';
  if (!draft.lastName.trim()) errors.lastName = 'نام خانوادگی الزامی است.';
  if (!/^9\d{9}$/.test(draft.mobile)) {
    errors.mobile = 'فرمت شماره موبایل معتبر نیست (۱۰ رقم بدون صفر اول).';
  }
  if (!isStaffAdminRole(draft.role)) {
    errors.role = 'انتخاب نقش ادمین الزامی است.';
  }
  return errors;
}

type StaffAdminsDetailCardProps = {
  admin: StaffAdminAccount | null;
  isLoading: boolean;
  errorMessage: string | null;
  saving?: boolean;
  saveError?: string | null;
  onSave?: (id: string, input: UpdateStaffAdminInput) => Promise<unknown>;
};

export function StaffAdminsDetailCard({
  admin,
  isLoading,
  errorMessage,
  saving = false,
  saveError = null,
  onSave,
}: StaffAdminsDetailCardProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<StaffAdminDraft | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  if (!admin && !isLoading && !errorMessage) return null;

  const editing = Boolean(admin && editingId === admin.id && draft);
  const canEdit = Boolean(admin && onSave);

  const closeEdit = () => {
    setEditingId(null);
    setDraft(null);
    setFieldErrors({});
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!admin || !draft || !onSave) return;
    const nextErrors = validateDraft(draft);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (!isStaffAdminRole(draft.role)) return;

    await onSave(admin.id, {
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      mobile: draft.mobile,
      role: draft.role,
      active: draft.active,
    });
    closeEdit();
  };

  return (
    <KvCard className="gap-0 border-kv-border py-0 shadow-kv-raised">
      <KvCardContent className="space-y-kv-group p-kv-inset sm:p-kv-block">
        <div className="flex items-center justify-between gap-kv-pair border-b border-kv-border pb-kv-inline">
          <div className="flex min-w-0 items-center gap-kv-pair">
            <KvCardTitleIcon icon={faIcons.user} />
            <KvTypography variant="subtitle" as="h4">
              جزئیات حساب ستادی
            </KvTypography>
          </div>
          {canEdit && !editing ? (
            <KvButton
              type="button"
              appearance="secondary"
              size="sm"
              onClick={() => {
                if (!admin) return;
                setDraft(draftFromAdmin(admin));
                setFieldErrors({});
                setEditingId(admin.id);
              }}
            >
              ویرایش
            </KvButton>
          ) : null}
        </div>

        {errorMessage ? (
          <KvTypography variant="caption" tone="danger" as="p">
            {errorMessage}
          </KvTypography>
        ) : null}

        {isLoading && !admin ? (
          <div
            className="flex items-center gap-kv-pair"
            role="status"
            aria-label="در حال دریافت جزئیات"
          >
            <FaIcon icon={faIcons.spinner} size="sm" spin className="text-kv-brand" />
            <KvTypography variant="caption" tone="muted" as="p">
              در حال دریافت جزئیات
            </KvTypography>
          </div>
        ) : admin && editing && draft ? (
          <form className="space-y-kv-group" onSubmit={onSubmit} noValidate>
            {saveError ? (
              <KvTypography variant="caption" tone="danger" as="p">
                {saveError}
              </KvTypography>
            ) : null}
            <div className="grid grid-cols-1 gap-kv-group sm:grid-cols-2">
              <KvTextField
                id="staff-admin-first-name"
                label="نام"
                required
                scriptGuard="none"
                value={draft.firstName}
                error={fieldErrors.firstName}
                onChange={(event) =>
                  setDraft((current) =>
                    current
                      ? { ...current, firstName: event.target.value }
                      : current
                  )
                }
              />
              <KvTextField
                id="staff-admin-last-name"
                label="نام خانوادگی"
                required
                scriptGuard="none"
                value={draft.lastName}
                error={fieldErrors.lastName}
                onChange={(event) =>
                  setDraft((current) =>
                    current
                      ? { ...current, lastName: event.target.value }
                      : current
                  )
                }
              />
              <KvMobileNumberField
                id="staff-admin-mobile"
                required
                value={draft.mobile}
                error={fieldErrors.mobile}
                onChange={(event) =>
                  setDraft((current) =>
                    current
                      ? {
                          ...current,
                          mobile: persianToEnglishDigits(event.target.value)
                            .replace(/\D/g, '')
                            .slice(0, 10),
                        }
                      : current
                  )
                }
              />
              <KvSelectField
                id="staff-admin-role"
                label="نقش ادمین"
                required
                value={draft.role}
                error={fieldErrors.role}
                onValueChange={(value) =>
                  setDraft((current) =>
                    current ? { ...current, role: value } : current
                  )
                }
              >
                {STAFF_ROLE_OPTIONS.map((option) => (
                  <KvSelectItem key={option.value} value={option.value}>
                    {option.label}
                  </KvSelectItem>
                ))}
              </KvSelectField>
              <KvSwitch
                id="staff-admin-active"
                label="حساب فعال"
                checked={draft.active}
                onCheckedChange={(checked) =>
                  setDraft((current) =>
                    current ? { ...current, active: checked } : current
                  )
                }
              />
            </div>
            <div className="flex justify-end gap-kv-pair border-t border-kv-border pt-kv-group">
              <KvButton
                type="button"
                appearance="secondary"
                size="md"
                disabled={saving}
                onClick={closeEdit}
              >
                انصراف
              </KvButton>
              <KvButton type="submit" color="cta" size="md" loading={saving}>
                ذخیره
              </KvButton>
            </div>
          </form>
        ) : admin ? (
          <div className="grid grid-cols-1 gap-kv-group sm:grid-cols-2">
            <Field
              label="نام"
              value={`${admin.firstName} ${admin.lastName}`.trim() || '—'}
            />
            <Field
              label="نقش"
              value={getRoleStrategy(admin.role).label}
            />
            <div className="space-y-kv-micro">
              <KvTypography variant="overline" tone="muted" as="p">
                موبایل
              </KvTypography>
              <span className="block font-mono" dir="ltr">
                <KvTypography variant="body" as="p">
                  {admin.mobile ? toPersianDigits(admin.mobile) : '—'}
                </KvTypography>
              </span>
            </div>
            <Field label="وضعیت" value={statusLabel(admin.statusName)} />
            <Field label="تاریخ ایجاد" value={createdLabel(admin.createdAt)} />
          </div>
        ) : null}
      </KvCardContent>
    </KvCard>
  );
}
