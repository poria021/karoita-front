'use client';

import type { CSSProperties } from 'react';

import { KarvitaBrandMark } from '@/components/shared/KarvitaBrandMark';
import { Spinner } from '@/components/ui/spinner';
import { WORKBENCH_LEARNER_WELCOME_STYLE } from '@/lib/workbench-grid';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store/useUserStore';
import type { UserRole } from '@/types/auth';

import { useCurrentTerms } from '../hooks/useCurrentTerms';
import {
  currentTermStatus,
  kindsForRole,
  type CurrentTermKind,
  type CurrentTermView,
} from '../lib/current-terms';
import { welcomeRoleOrgLine } from '../lib/welcome-identity';
import { STATUS_LABEL } from './WorkbenchTermTile';

export type WorkbenchWelcomeBoxProps = {
  /** نام نمایشی کاربر — در تیتر «{نام} خوش آمدید». */
  displayName: string;
  /** نقش فعال؛ برای نقش‌های مدیریتی دو باکس وضعیت ترم نشان داده می‌شود. */
  role?: UserRole;
  className?: string;
  style?: CSSProperties;
};

/**
 * نقش‌هایی که در خوش‌آمد، وضعیت نیم‌سال را می‌بینند. نقش‌های مدیریتی هر دو چیپ (ترمی و پودمانی)،
 * دانشجو فقط ترمی و مهارت‌آموز فقط پودمانی (`kindsForRole`).
 */
const WELCOME_TERM_STATUS_ROLES: ReadonlySet<UserRole> = new Set([
  'student',
  'skill_learner',
  'supervisor_professor',
  'mentor_teacher',
  'school_principal',
  'regional_edu_admin',
  'faculty_role',
  'provincial_university',
  'central_organization',
  'assistant_admin',
  'super_admin',
]);

const SHORT_KIND_LABEL: Record<CurrentTermKind, string> = {
  semester: 'ترمی',
  podmani: 'پودمانی',
};

const EMPTY_SEMESTER: CurrentTermView = {
  kind: 'semester',
  kindLabel: 'نیم‌سال ترمی',
  title: null,
  enrollOpen: null,
  classesStarted: null,
  lessonCount: null,
};

const EMPTY_PODMANI: CurrentTermView = {
  kind: 'podmani',
  kindLabel: 'پودمان',
  title: null,
  enrollOpen: null,
  classesStarted: null,
  lessonCount: null,
};

function isTermOpen(view: CurrentTermView): boolean {
  if (view.title === null) return false;
  const status = currentTermStatus(view);
  return status === 'running' || status === 'selecting';
}

function statusText(view: CurrentTermView): string {
  const status = currentTermStatus(view);
  if (status === 'unknown' || status === 'closed') {
    return view.title === null ? 'بدون ترم' : STATUS_LABEL.closed;
  }
  return STATUS_LABEL[status];
}

function WelcomeTermStatusChip({
  view,
  loading,
  className,
  /** داخل پنل آبی = شیشه؛ بیرون (موبایل) = سطح معمولی. */
  variant = 'on-panel',
}: {
  view: CurrentTermView;
  loading: boolean;
  className?: string;
  variant?: 'on-panel' | 'standalone';
}) {
  const shell = cn(
    'flex h-[3.35rem] shrink-0 flex-col justify-center rounded-kv-control border px-2.5',
    variant === 'on-panel'
      ? 'kv-welcome-chip w-[9.75rem]'
      : 'w-full min-w-0 flex-1 border-kv-border/70 bg-kv-surface shadow-kv-soft',
    className
  );

  if (loading) {
    return (
      <div
        role="status"
        aria-label="در حال بارگذاری نیم‌سال"
        className={cn(shell, 'items-center justify-center')}
      >
        <Spinner className="size-4 text-kv-brand" aria-hidden="true" />
      </div>
    );
  }

  const open = isTermOpen(view);
  const title = view.title ?? 'نیم‌سال فعالی ندارد';

  return (
    <article
      aria-label={`${SHORT_KIND_LABEL[view.kind]}: ${title} — ${statusText(view)}`}
      className={cn(shell, 'gap-0.5')}
    >
      <div className="flex items-center gap-1.5">
        <span
          aria-hidden
          className={cn(
            'size-2 shrink-0 rounded-full',
            open ? 'bg-kv-success' : 'bg-kv-danger'
          )}
        />
        <span className="text-[0.625rem] font-bold tracking-wide text-kv-text-muted">
          {SHORT_KIND_LABEL[view.kind]}
        </span>
        <span
          className={cn(
            'ms-auto truncate text-[0.625rem] font-bold',
            open ? 'text-kv-success' : 'text-kv-danger'
          )}
        >
          {statusText(view)}
        </span>
      </div>
      <p
        title={title}
        className={cn(
          'truncate text-xs font-black leading-snug',
          view.title ? 'text-kv-text' : 'text-kv-text-faint'
        )}
      >
        {title}
      </p>
    </article>
  );
}

function WelcomeTermStatusChips({
  kinds,
  semesterView,
  podmaniView,
  isLoading,
  className,
  chipClassName,
  variant = 'on-panel',
}: {
  kinds: readonly CurrentTermKind[];
  semesterView: CurrentTermView | undefined;
  podmaniView: CurrentTermView | undefined;
  isLoading: boolean;
  className?: string;
  chipClassName?: string;
  variant?: 'on-panel' | 'standalone';
}) {
  return (
    <div
      aria-label="وضعیت نیم‌سال جاری"
      className={cn(
        'kv-welcome-enter-delay flex shrink-0 items-center gap-1.5 sm:gap-2',
        className
      )}
    >
      {kinds.includes('semester') ? (
        <WelcomeTermStatusChip
          view={semesterView ?? EMPTY_SEMESTER}
          loading={isLoading}
          className={chipClassName}
          variant={variant}
        />
      ) : null}
      {kinds.includes('podmani') ? (
        <WelcomeTermStatusChip
          view={podmaniView ?? EMPTY_PODMANI}
          loading={isLoading}
          className={chipClassName}
          variant={variant}
        />
      ) : null}
    </div>
  );
}

/**
 * باکس خوش‌آمد میز کار: تیتر، نقش · واحد، و وضعیت نیم‌سال.
 * دسکتاپ: چیپ‌ها داخل پنل آبی؛ موبایل: بیرون و زیر پنل، تمام‌عرض.
 */
export function WorkbenchWelcomeBox({
  displayName,
  role,
  className,
  style,
}: WorkbenchWelcomeBoxProps) {
  const activeUser = useUserStore((state) => state.activeUser);
  const showTermStatus = role != null && WELCOME_TERM_STATUS_ROLES.has(role);
  const { isLoading, views } = useCurrentTerms(
    showTermStatus ? role : undefined
  );
  const kinds = role != null ? kindsForRole(role) : [];
  const semesterView = views.find((view) => view.kind === 'semester');
  const podmaniView = views.find((view) => view.kind === 'podmani');
  const roleOrgLine =
    role != null
      ? welcomeRoleOrgLine(role, {
          college: activeUser?.college,
          school: activeUser?.school,
          district: activeUser?.district,
          province: activeUser?.province,
          city: activeUser?.city,
        })
      : null;

  return (
    <div
      style={style}
      className={cn(
        'flex flex-col gap-kv-group sm:h-full sm:min-h-0 sm:gap-0',
        className
      )}
    >
      <section
        aria-labelledby="dashboard-welcome-title"
        style={WORKBENCH_LEARNER_WELCOME_STYLE}
        className="kv-welcome-panel relative flex shrink-0 flex-col overflow-hidden rounded-kv-panel border"
      >
        <div
          aria-hidden
          className="kv-welcome-wash pointer-events-none absolute inset-0"
        />
        <KarvitaBrandMark className="kv-welcome-mark pointer-events-none absolute -bottom-3 -end-2 size-28 sm:size-32" />

        <div
          className={cn(
            'relative z-[1] flex min-h-0 flex-1 items-center gap-kv-group p-kv-group',
            showTermStatus && 'pe-20 sm:pe-24'
          )}
        >
          <div className="kv-welcome-enter flex min-w-0 flex-1 flex-col justify-center gap-0.5">
            <p className="line-clamp-1 min-w-0 text-xs font-medium leading-snug text-kv-text-muted sm:text-sm">
              میز کار {displayName}
            </p>
            <h3
              id="dashboard-welcome-title"
              className="line-clamp-1 min-w-0 text-xl font-black leading-snug tracking-tight text-kv-brand sm:text-2xl"
            >
              خوش آمدید
            </h3>
            {roleOrgLine ? (
              <p
                title={roleOrgLine}
                className="line-clamp-1 min-w-0 text-xs font-medium text-kv-text-muted"
              >
                {roleOrgLine}
              </p>
            ) : null}
          </div>

          {showTermStatus ? (
            <WelcomeTermStatusChips
              kinds={kinds}
              semesterView={semesterView}
              podmaniView={podmaniView}
              isLoading={isLoading}
              className="hidden sm:flex"
            />
          ) : null}
        </div>
      </section>

      {showTermStatus ? (
        <WelcomeTermStatusChips
          kinds={kinds}
          semesterView={semesterView}
          podmaniView={podmaniView}
          isLoading={isLoading}
          variant="standalone"
          className="w-full sm:hidden"
          chipClassName="h-auto min-h-[3.35rem] py-2"
        />
      ) : null}
    </div>
  );
}
