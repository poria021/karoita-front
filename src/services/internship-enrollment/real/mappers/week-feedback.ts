import { fromNestRoleName } from '@/services/auth/real/nest-auth-role';
import type { UserRole } from '@/types/auth';
import type { NestMessage, NestMessageSender } from '@/types/nest-conversations';
import type {
  InternshipCompetencyRating,
  InternshipWeeklyReportFeedback,
} from '@/types/internship-enrollment';

type FeedbackRole = 'advisor' | 'mentor' | 'principal';

const FEEDBACK_ROLE_BY_USER_ROLE: Partial<Record<UserRole, FeedbackRole>> = {
  supervisor_professor: 'advisor',
  mentor_teacher: 'mentor',
  school_principal: 'principal',
};

/**
 * لایو تأیید شد: `senderId` روی هر پیام یک سند `{id, role}` است، نه رشتهٔ خام —
 * نیازی به `GET /users/{id}` جدا نیست. مقایسه با professorId/teacherId فقط
 * fallback دفاعی است، برای وقتی `role` سرور خالی/نامعتبر برگردد.
 */
function bucketForSender(
  sender: NestMessageSender,
  knownRoles: { professorId?: string | null; mentorId?: string | null }
): FeedbackRole | null {
  const role = fromNestRoleName(sender.role);
  const bucket = FEEDBACK_ROLE_BY_USER_ROLE[role];
  if (bucket) return bucket;
  if (knownRoles.professorId && sender.id === knownRoles.professorId) return 'advisor';
  if (knownRoles.mentorId && sender.id === knownRoles.mentorId) return 'mentor';
  return null;
}

function toCompetencyRating(
  rating: number | null | undefined
): InternshipCompetencyRating | undefined {
  if (typeof rating !== 'number' || !Number.isFinite(rating)) return undefined;
  const rounded = Math.round(rating);
  return rounded >= 1 && rounded <= 5
    ? (String(rounded) as InternshipCompetencyRating)
    : undefined;
}

/**
 * پیام‌های یک گفتگوی هفته را به بازخورد/امتیاز/زمانِ استاد/معلم/مدیر تفکیک
 * می‌کند — آخرین پیامِ هر نقش برنده است (متن، زمان و امتیاز، مستقل از هم).
 *
 * زمان هر بازخورد (`{role}At`) هم برای نمایش تاریخ زیر باکس همان نقش لازم است،
 * هم برای تشخیص وضعیت «رد شده» در `mapWeekStatus`: خودِ متنِ بازخورد استاد
 * به‌تنهایی کافی نیست، چون بعد از یک‌بار رد شدن، آن پیام تا ابد در گفتگو
 * می‌ماند — باید زمانش با زمانِ آخرین ارسال دانشجو مقایسه شود تا بعد از اصلاح
 * و ارسال دوباره، هفته اشتباهاً `needs_edit` نماند.
 */
export function resolveWeekFeedback(
  messages: readonly NestMessage[],
  knownRoles: { professorId?: string | null; mentorId?: string | null }
): InternshipWeeklyReportFeedback | undefined {
  const feedback: InternshipWeeklyReportFeedback = {};
  const sorted = [...messages].sort((a, b) => a.sequence - b.sequence);

  for (const message of sorted) {
    const bucket = bucketForSender(message.senderId, knownRoles);
    if (!bucket) continue;

    const text = message.text?.trim();
    if (text) {
      if (bucket === 'advisor') {
        feedback.advisor = text;
        feedback.advisorAt = message.createdAt;
      } else if (bucket === 'mentor') {
        feedback.mentor = text;
        feedback.mentorAt = message.createdAt;
      } else {
        feedback.principal = text;
        feedback.principalAt = message.createdAt;
      }
    }

    if (bucket === 'mentor' || bucket === 'principal') {
      const rating = toCompetencyRating(message.rating);
      if (rating) {
        if (bucket === 'mentor') feedback.mentorRating = rating;
        else feedback.principalRating = rating;
      }
    }
  }

  return Object.keys(feedback).length > 0 ? feedback : undefined;
}
