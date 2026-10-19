const fs = require('fs');
const root = 'C:/Users/ak47/Desktop/better-auth-starter/';

function readEol(p) {
  const text = fs.readFileSync(root + p, 'utf8');
  return { text, eol: text.includes('\r\n') ? '\r\n' : '\n' };
}
function edit(file, pairs) {
  let { text, eol } = readEol(file);
  for (const [from, to] of pairs) {
    const a = from.replace(/\n/g, eol);
    const n = text.split(a).length - 1;
    if (n !== 1) throw new Error(`${file}: ${n} matches for: ${from.slice(0, 80)}`);
    text = text.replace(a, () => to.replace(/\n/g, eol));
  }
  fs.writeFileSync(root + file, text, 'utf8');
  console.log('edited', file);
}
function write(file, content, eolFrom) {
  const eol = eolFrom ? readEol(eolFrom).eol : '\r\n';
  fs.writeFileSync(root + file, content.replace(/\r\n/g, '\n').replace(/\n/g, eol), 'utf8');
  console.log('wrote', file);
}
function remove(file) {
  fs.unlinkSync(root + file);
  console.log('removed', file);
}

// ───────────── ۱) قاعدهٔ جدید دید پیوست‌ها ─────────────
write(
  'src/services/daily-approvals/attachment-visibility.ts',
  `import type { UserRole } from '@/types/auth';
import type {
  DailyApprovalTrainee,
  DailyApprovalWeek,
  DailyApprovalWeekDetail,
} from '@/types/daily-approvals';

/**
 * گزارش دانشجو/مهارت‌آموز به‌محض ارسال برای هر سه نفر (استاد راهنما، معلم راهنما،
 * مدیر مدرسه) می‌رود؛ فقط **فایل‌های پیوست** تا تیک استاد راهنما (\`canWatchOthers\`)
 * از معلم و مدیر مدرسه پنهان می‌ماند. پیش‌فرض \`false\` است.
 *
 * فیلتر اصلی باید سمت Nest باشد؛ این‌جا (mock و real) دفاع سمت کلاینت است.
 */
const ATTACHMENT_GATED_ROLES = new Set<UserRole>([
  'mentor_teacher',
  'school_principal',
]);

export function isAttachmentGatedRole(
  role: UserRole | null | undefined
): boolean {
  return Boolean(role && ATTACHMENT_GATED_ROLES.has(role));
}

/** استاد راهنما همیشه؛ معلم/مدیر فقط وقتی استاد تیک را زده (\`=== true\`). */
export function canViewWeekAttachments(
  role: UserRole | null | undefined,
  canWatchOthers: boolean | null | undefined
): boolean {
  if (!isAttachmentGatedRole(role)) return true;
  return canWatchOthers === true;
}

export function maskWeekAttachments(
  week: DailyApprovalWeek,
  role: UserRole | null | undefined
): DailyApprovalWeek {
  if (canViewWeekAttachments(role, week.canWatchOthers)) return week;
  if (week.files.length === 0) return week;
  return { ...week, files: [], attachmentsHidden: true };
}

export function maskTraineeAttachments(
  trainee: DailyApprovalTrainee,
  role: UserRole | null | undefined
): DailyApprovalTrainee {
  if (!isAttachmentGatedRole(role)) return trainee;
  return {
    ...trainee,
    weeks: trainee.weeks.map((week) => maskWeekAttachments(week, role)),
  };
}

export function maskWeekDetailAttachments(
  detail: DailyApprovalWeekDetail,
  role: UserRole | null | undefined,
  canWatchOthers: boolean | null | undefined
): DailyApprovalWeekDetail {
  if (canViewWeekAttachments(role, canWatchOthers)) return detail;
  if (detail.files.length === 0) return detail;
  return { ...detail, files: [], attachmentsHidden: true };
}
`,
  'src/services/daily-approvals/forward-visibility.ts'
);

write(
  'src/services/daily-approvals/attachment-visibility.test.ts',
  `import { describe, expect, it } from 'vitest';

import type {
  DailyApprovalTrainee,
  DailyApprovalWeek,
} from '@/types/daily-approvals';

import {
  canViewWeekAttachments,
  maskTraineeAttachments,
  maskWeekAttachments,
  maskWeekDetailAttachments,
} from './attachment-visibility';

const FILE = { id: 'f1', name: 'a.pdf', sizeMb: 1, mimeType: 'application/pdf' };

function week(patch: Partial<DailyApprovalWeek> = {}): DailyApprovalWeek {
  return {
    id: 'w1',
    weekNumber: 1,
    status: 'pending',
    score: null,
    text: 'گزارش',
    files: [FILE],
    feedback: {},
    readBySupervisor: false,
    ...patch,
  };
}

describe('attachment-visibility', () => {
  it('استاد راهنما همیشه پیوست را می‌بیند؛ معلم و مدیر فقط با تیک true', () => {
    expect(canViewWeekAttachments('supervisor_professor', false)).toBe(true);
    expect(canViewWeekAttachments('mentor_teacher', undefined)).toBe(false);
    expect(canViewWeekAttachments('mentor_teacher', false)).toBe(false);
    expect(canViewWeekAttachments('school_principal', false)).toBe(false);
    expect(canViewWeekAttachments('mentor_teacher', true)).toBe(true);
    expect(canViewWeekAttachments('school_principal', true)).toBe(true);
  });

  it('متن و نمرهٔ گزارش می‌ماند؛ فقط فایل‌ها پنهان و پرچم می‌شود', () => {
    const masked = maskWeekAttachments(week({ score: 80 }), 'mentor_teacher');
    expect(masked).toMatchObject({
      text: 'گزارش',
      score: 80,
      files: [],
      attachmentsHidden: true,
    });
  });

  it('با تیک true یا برای استاد، هفته دست‌نخورده برمی‌گردد', () => {
    const open = week({ canWatchOthers: true });
    expect(maskWeekAttachments(open, 'school_principal')).toBe(open);
    const closed = week({ canWatchOthers: false });
    expect(maskWeekAttachments(closed, 'supervisor_professor')).toBe(closed);
  });

  it('هفتهٔ بدون فایل پرچم «پنهان» نمی‌گیرد', () => {
    const empty = week({ files: [] });
    expect(maskWeekAttachments(empty, 'mentor_teacher')).toBe(empty);
  });

  it('کل کارورز و جزئیات هفتهٔ real هم همین قاعده را دارند', () => {
    const trainee = { weeks: [week(), week({ id: 'w2', canWatchOthers: true })] } as DailyApprovalTrainee;
    const masked = maskTraineeAttachments(trainee, 'school_principal');
    expect(masked.weeks[0]).toMatchObject({ files: [], attachmentsHidden: true });
    expect(masked.weeks[1]!.files).toHaveLength(1);
    expect(maskTraineeAttachments(trainee, 'supervisor_professor')).toBe(trainee);

    const detail = { text: 't', files: [FILE], feedback: {} };
    expect(maskWeekDetailAttachments(detail, 'mentor_teacher', false)).toMatchObject({
      files: [],
      attachmentsHidden: true,
    });
    expect(maskWeekDetailAttachments(detail, 'mentor_teacher', true)).toBe(detail);
  });
});
`,
  'src/services/daily-approvals/forward-visibility.ts'
);

remove('src/services/daily-approvals/forward-visibility.ts');
remove('src/services/daily-approvals/forward-visibility.test.ts');
remove('src/features/karvita/daily-approvals/components/DailyApprovalForwardPanel.tsx');

// ───────────── ۲) تایپ‌ها ─────────────
edit('src/types/daily-approvals.ts', [
  [
    "/** مقصد ارجاع گزارش از طرف استاد راهنما. */\nexport type DailyApprovalForwardTarget = 'mentor' | 'principal';\n\n",
    '',
  ],
  [
    "  /** استاد راهنما اجازه داده این کارورز گزارش‌های هم‌کلاسی‌ها را ببیند. */\n  canWatchOthers?: boolean;\n",
    "  /**\n   * تیک استاد راهنما: فایل‌های پیوست گزارش برای معلم راهنما و مدیر مدرسه باز می‌شود.\n   * پیش‌فرض `false` — متن و نمرهٔ گزارش همیشه برای هر سه نقش است، فقط پیوست‌ها قفل‌اند.\n   */\n  canWatchOthers?: boolean;\n",
  ],
  [
    "  /**\n   * مقصدهایی که استاد گزارش را برایشان فرستاده؛ معلم/مدیر مدرسه فقط گزارش\n   * ارجاع‌شده به خودشان را می‌بینند. فقط mock تا آمدن endpoint ارجاع در Nest.\n   */\n  forwardedTo?: DailyApprovalForwardTarget[];\n};",
    "  /** فایل‌های پیوست برای نقش جاری (معلم/مدیر) پنهان شده چون استاد راهنما تیک را نزده. */\n  attachmentsHidden?: boolean;\n};",
  ],
  [
    "  feedback: InternshipWeeklyReportFeedback;\n};\n\nexport type ListDailyApprovalsInput",
    "  feedback: InternshipWeeklyReportFeedback;\n  /** فایل‌های پیوست برای نقش جاری پنهان شده (ببین `DailyApprovalWeek.attachmentsHidden`). */\n  attachmentsHidden?: boolean;\n};\n\nexport type ListDailyApprovalsInput",
  ],
  [
    "export type ForwardDailyApprovalWeekInput = {\n  traineeId: string;\n  weekId: string;\n  target: DailyApprovalForwardTarget;\n};\n\n",
    '',
  ],
]);

// ───────────── ۳) سرویس ─────────────
edit('src/services/daily-approvals.service.ts', [
  ['  forwardMockDailyApprovalWeek,\n', ''],
  [
    "import { forwardTargetForRole, maskUnforwardedWeeks } from '@/services/daily-approvals/forward-visibility';\n",
    "import {\n  isAttachmentGatedRole,\n  maskTraineeAttachments,\n  maskWeekDetailAttachments,\n} from '@/services/daily-approvals/attachment-visibility';\n",
  ],
  ['  ForwardDailyApprovalWeekInput,\n', ''],
  [
    `    if (!forwardTargetForRole(role)) return page;
    // معلم/مدیر فقط هفته‌های ارجاع‌شده را می‌بینند.
    const threshold = readDailyApprovalPassingScoreThreshold();
    return {
      ...page,
      items: page.items.map((row) => maskUnforwardedWeeks(row, role, threshold)),
    };
  },
`,
    `    // گزارش برای هر سه نقش می‌رود؛ پیوست‌ها تا تیک استاد راهنما از معلم/مدیر پنهان است.
    if (!isAttachmentGatedRole(role)) return page;
    return {
      ...page,
      items: page.items.map((row) => maskTraineeAttachments(row, role)),
    };
  },
`,
  ],
  [
    `  /**
   * استاد راهنما گزارش یک هفته را برای معلم یا مدیر مدرسه ارجاع می‌دهد.
   * فقط mock؛ real تا آمدن endpoint در Nest fail-closed است.
   */
  async forwardWeek(
    input: ForwardDailyApprovalWeekInput
  ): Promise<DailyApprovalTrainee> {
    if (isRealApiMode()) {
      throwRealModeNotImplemented('DailyApprovalsService.forwardWeek');
    }
    requireReviewRole('supervisor_professor');
    await new Promise((resolve) => setTimeout(resolve, 200));
    return forwardMockDailyApprovalWeek(input);
  },

`,
    '',
  ],
  [
    `    role: UserRole | null | undefined;
    teacherId?: string | null;
  }): Promise<DailyApprovalWeekDetail> {
    return loadRealDailyApprovalWeekDetail({
      enrollmentId: input.traineeId,
      weekId: input.weekId,
      role: input.role,
      teacherId: input.teacherId,
    });
  },`,
    `    role: UserRole | null | undefined;
    teacherId?: string | null;
    /** تیک استاد راهنما برای همین هفته؛ بدون آن پیوست‌ها از معلم/مدیر پنهان می‌ماند. */
    canWatchOthers?: boolean;
  }): Promise<DailyApprovalWeekDetail> {
    const detail = await loadRealDailyApprovalWeekDetail({
      enrollmentId: input.traineeId,
      weekId: input.weekId,
      role: input.role,
      teacherId: input.teacherId,
    });
    return maskWeekDetailAttachments(detail, input.role, input.canWatchOthers);
  },`,
  ],
]);

// ───────────── ۴) mock ─────────────
{
  const file = 'src/services/daily-approvals/mock/mock-daily-approvals-mutations.ts';
  let { text, eol } = readEol(file);
  const start = text.indexOf('/** استاد گزارش یک هفته را برای معلم راهنما یا مدیر مدرسه ارجاع می‌دهد');
  const end = text.indexOf('export function updateMockMentorDailyApprovalWeek');
  if (start < 0 || end < 0 || end < start) throw new Error('mock forward block not found');
  text = text.slice(0, start) + text.slice(end);
  const imp = '  ForwardDailyApprovalWeekInput,' + eol;
  if (text.split(imp).length - 1 !== 1) throw new Error('mock import not unique');
  text = text.replace(imp, '');
  fs.writeFileSync(root + file, text, 'utf8');
  console.log('edited', file);
}
edit('src/services/daily-approvals/mock/mock-daily-approvals-store.ts', [
  ['  forwardMockDailyApprovalWeek,\n', ''],
]);

// ───────────── ۵) UI ─────────────
edit('src/features/karvita/daily-approvals/components/DailyApprovalWeekGrid.tsx', [
  ["import type { UserRole } from '@/types/auth';\n", ''],
  ["import { FORWARD_TARGET_LABEL } from '@/services/daily-approvals/forward-visibility';\n", ''],
  ['  role?: UserRole | null;\n', ''],
  ['  compact = false,\n  role,\n  onSelectWeek,', '  compact = false,\n  onSelectWeek,'],
  [
    `        const blockedForObserver =
          (role === 'mentor_teacher' || role === 'school_principal') &&
          week.canWatchOthers === false;
        const visual = getWeekVisual(blockedForObserver ? 'draft' : week.status);
`,
    '        const visual = getWeekVisual(week.status);\n',
  ],
  [
    `        const label =
          blockedForObserver
            ? 'قفل شده'
            : week.status === 'draft'
              ? draftCardLabel(week)
              : visual.label;
        // تا وقتی دانشجو گزارشی نفرستاده (status === 'draft') یا اجازهٔ مشاهده
        // برای معلم/مدیر مدرسه غیرفعال است، کارت باید باز نشود.
        const locked =
          week.status === 'locked_future' ||
          week.status === 'draft' ||
          blockedForObserver;
`,
    `        const label =
          week.status === 'draft' ? draftCardLabel(week) : visual.label;
        // تا وقتی دانشجو گزارشی نفرستاده (status === 'draft') کارت باید باز نشود؛
        // بعد از ارسال برای استاد، معلم و مدیر مدرسه هر سه باز می‌شود.
        const locked =
          week.status === 'locked_future' || week.status === 'draft';
`,
  ],
  [
    `              {week.forwardedTo && week.forwardedTo.length > 0 ? (
                <span
                  className="flex w-full items-center"
                  title={\`ارجاع‌شده به \${week.forwardedTo
                    .map((target) => FORWARD_TARGET_LABEL[target])
                    .join(' و ')}\`}
                  role="img"
                  aria-label="ارجاع‌شده"
                >
                  <FaIcon icon={faIcons.paperPlane} size="xs" />
                </span>
              ) : null}
`,
    '',
  ],
]);

edit('src/features/karvita/daily-approvals/components/DailyApprovalDetailPanel.tsx', [
  ['          selectedWeekId={selectedWeekId}\n          role={role}\n          onSelectWeek={onSelectWeek}', '          selectedWeekId={selectedWeekId}\n          onSelectWeek={onSelectWeek}'],
]);
edit('src/features/karvita/daily-approvals/components/DailyApprovalsMobileWorkspace.tsx', [
  ['                      compact\n                      role={role}\n', '                      compact\n'],
]);

edit('src/features/karvita/daily-approvals/components/DailyApprovalWeekGradingModal.tsx', [
  ['  DailyApprovalForwardTarget,\n', ''],
  ["import { DailyApprovalForwardPanel } from './DailyApprovalForwardPanel';\n", ''],
  ['  onForward: (target: DailyApprovalForwardTarget) => void;\n', ''],
  ['  onClose,\n  onForward,\n  onCanWatchOthersChange,', '  onClose,\n  onCanWatchOthersChange,'],
  [
    `              {role === 'supervisor_professor' && IS_MOCK_MODE ? (
                <DailyApprovalForwardPanel
                  week={effectiveWeek}
                  readOnly={modal.supervisorLocked}
                  busy={actionBusy}
                  onForward={onForward}
                />
              ) : null}

`,
    '',
  ],
]);

edit('src/features/karvita/daily-approvals/components/DailyApprovalsPageClient.tsx', [
  ['          onForward={page.forwardWeek}\n', ''],
]);
edit('src/features/karvita/daily-approvals/hooks/useDailyApprovalsPage.ts', [
  ['    forwardWeek: actions.forwardWeek,\n', ''],
]);

edit('src/features/karvita/daily-approvals/components/DailyApprovalSupervisorGradingFields.tsx', [
  [
    `              مشاهده معلم و مدیر مدرسه
            </KvTypography>
            <KvTypography variant="caption" tone="muted" as="p">
              با فعال‌سازی، معلم راهنما و مدیر مدرسه می‌توانند گزارش این هفته را
              ببینند.
            </KvTypography>`,
    `              نمایش فایل‌های پیوست به معلم و مدیر مدرسه
            </KvTypography>
            <KvTypography variant="caption" tone="muted" as="p">
              گزارش برای هر سه نفر ارسال می‌شود، ولی فایل‌های پیوست فقط دست شماست.
              با فعال‌سازی، پیوست‌های این هفته برای معلم راهنما و مدیر مدرسه هم باز
              می‌شود.
            </KvTypography>`,
  ],
]);

edit('src/features/karvita/daily-approvals/components/DailyApprovalWeekReportReadonly.tsx', [
  [
    `        ) : (
          <div className="rounded-kv-control border border-dashed border-kv-border bg-kv-surface-muted p-kv-group text-center">`,
    `        ) : week.attachmentsHidden ? (
          <div className="rounded-kv-control border border-dashed border-kv-border bg-kv-surface-muted p-kv-group text-center">
            <KvTypography variant="caption" tone="muted" weight="bold">
              پیوست‌های این گزارش تا زمان تأیید استاد راهنما برای شما نمایش داده
              نمی‌شود.
            </KvTypography>
          </div>
        ) : (
          <div className="rounded-kv-control border border-dashed border-kv-border bg-kv-surface-muted p-kv-group text-center">`,
  ],
]);

// ───────────── ۶) هوک اکشن‌ها ─────────────
{
  const file = 'src/features/karvita/daily-approvals/hooks/useDailyApprovalsActions.ts';
  let { text, eol } = readEol(file);
  const start = text.indexOf('  /** استاد گزارش هفتهٔ بازشده را برای معلم/مدیر ارجاع می‌دهد؛ مودال باز می‌ماند. */');
  const end = text.indexOf('  /**' + eol + '   * استاد راهنما: اجازهٔ دیدن گزارش هم‌کلاسی‌ها برای این هفتهٔ کارورز.');
  if (start < 0 || end < 0 || end < start) throw new Error('actions forward block not found');
  text = text.slice(0, start) + text.slice(end);
  fs.writeFileSync(root + file, text, 'utf8');
  console.log('edited(1/2)', file);
}
edit('src/features/karvita/daily-approvals/hooks/useDailyApprovalsActions.ts', [
  ['  DailyApprovalForwardTarget,\n', ''],
  ['    forwardWeek,\n', ''],
  [
    "          feedback: weekDetail.detail.feedback,\n        }\n",
    "          feedback: weekDetail.detail.feedback,\n          attachmentsHidden: weekDetail.detail.attachmentsHidden,\n        }\n",
  ],
  [
    `        week.status === 'draft' ||
        ((role === 'mentor_teacher' || role === 'school_principal') &&
          week.canWatchOthers === false)
      ) {`,
    `        week.status === 'draft'
      ) {`,
  ],
  [
    "          teacherId: trainee.teacherId,\n        })",
    "          teacherId: trainee.teacherId,\n          canWatchOthers: week.canWatchOthers,\n        })",
  ],
  [
    `   * استاد راهنما: اجازهٔ دیدن گزارش هم‌کلاسی‌ها برای این هفتهٔ کارورز.`,
    `   * استاد راهنما: تیک نمایش فایل‌های پیوست این هفته به معلم راهنما و مدیر مدرسه.`,
  ],
  [
    `            ? 'دسترسی مشاهدهٔ گزارش هم‌کلاسی‌ها فعال شد.'
            : 'دسترسی مشاهدهٔ گزارش هم‌کلاسی‌ها غیرفعال شد.'`,
    `            ? 'فایل‌های پیوست برای معلم راهنما و مدیر مدرسه باز شد.'
            : 'فایل‌های پیوست فقط برای شما نمایش داده می‌شود.'`,
  ],
  [
    `            : 'تغییر دسترسی مشاهده ناموفق بود.'`,
    `            : 'تغییر نمایش فایل‌های پیوست ناموفق بود.'`,
  ],
]);

// ───────────── ۷) سرور جعلی: پیوست پیام دانشجو برای معلم/مدیر ─────────────
edit('tools/fake-nest/handlers/conversations.ts', [
  [
    `function messageDto(store: Store, message: StoredMessage) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: { id: message.senderId, role: message.senderRole },
    text: message.text,
    fileIds: message.fileIds,
    files: message.fileIds.map((id) => ({ id, path: storageUrl(store, id) })),`,
    `function messageDto(store: Store, message: StoredMessage, hideFiles = false) {
  const fileIds = hideFiles ? [] : message.fileIds;
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: { id: message.senderId, role: message.senderRole },
    text: message.text,
    fileIds,
    files: fileIds.map((id) => ({ id, path: storageUrl(store, id) })),`,
  ],
  [
    `function loadConversation(`,
    `/**
 * گزارش دانشجو برای هر سه نقش می‌رود، ولی فایل‌های پیوستش تا تیک استاد راهنما
 * (\`canWatchOthers\` هفته، پیش‌فرض false) از معلم و مدیر مدرسه پنهان می‌ماند.
 */
function shouldHideFiles(
  store: Store,
  conversation: StoredConversation,
  viewer: StoredUser,
  message: StoredMessage
): boolean {
  if (viewer.roleName !== 'teacher' && viewer.roleName !== 'school_admin') return false;
  if (message.senderRole !== 'student' && message.senderRole !== 'trainee') return false;
  if (!conversation.weekId || message.fileIds.length === 0) return false;
  const week = [...store.studentWeeks.values()].find(
    (row) => row.enrollmentId === conversation.enrollmentId && row.weekId === conversation.weekId
  );
  return week?.canWatchOthers !== true;
}

function loadConversation(`,
  ],
  [
    "        data: newer.slice(0, limit).map((message) => messageDto(store, message)),",
    "        data: newer\n          .slice(0, limit)\n          .map((message) =>\n            messageDto(store, message, shouldHideFiles(store, conversation, user, message))\n          ),",
  ],
  [
    "      data: older.slice(-limit).map((message) => messageDto(store, message)),",
    "      data: older\n        .slice(-limit)\n        .map((message) =>\n          messageDto(store, message, shouldHideFiles(store, conversation, user, message))\n        ),",
  ],
]);

edit('tools/fake-nest/enrollments.test.ts', [
  [
    "describe('تأیید حضور فقط با مدیر همان مدرسه",
    "describe('تأیید حضور فقط با مدیر همان مدرسه",
  ],
]);
