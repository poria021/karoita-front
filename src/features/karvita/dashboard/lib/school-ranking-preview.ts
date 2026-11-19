import type { SchoolRankingSummary } from '../hooks/useDashboardSchoolRanking';

/**
 * پیش‌نمایش باکس «ضعیف‌ترین و قوی‌ترین مدارس منطقه» با داده‌ی ماکت.
 *
 * - `true` (و فقط در development): `WorkbenchSchoolRankingBox` به‌جای داده‌ی واقعی
 *   از `FAKE_SCHOOL_RANKING` می‌خواند.
 * - برای برگشت به داده‌ی واقعی این را `false` کنید (یا فایل را پاک کنید).
 * در build تولید (`NODE_ENV === 'production'`) هرگز فعال نمی‌شود.
 */
const FAKE_PREVIEW_SWITCH = true;

export const SCHOOL_RANKING_FAKE_PREVIEW =
  FAKE_PREVIEW_SWITCH && process.env.NODE_ENV !== 'production';

/** امتیاز = میانگین نمرهٔ فراگیران (از ۲۰)؛ ضعیف‌ترین‌ها صعودی، قوی‌ترین‌ها نزولی. */
export const FAKE_SCHOOL_RANKING: SchoolRankingSummary = {
  weakest: [
    {
      id: 'fake-school-w1',
      rank: 1,
      name: 'هنرستان فنی شهید رجایی',
      subtitle: 'منطقه ۱۲ تهران',
      score: 9.5,
    },
    {
      id: 'fake-school-w2',
      rank: 2,
      name: 'دبیرستان دخترانه نرجس',
      subtitle: 'منطقه ۵ تهران',
      score: 10.25,
    },
    {
      id: 'fake-school-w3',
      rank: 3,
      name: 'هنرستان کاردانش امام صادق',
      subtitle: 'منطقه ۱۸ تهران',
      score: 11,
    },
    {
      id: 'fake-school-w4',
      rank: 4,
      name: 'دبیرستان پسرانه شهید مطهری',
      subtitle: 'منطقه ۱۴ تهران',
      score: 11.75,
    },
    {
      id: 'fake-school-w5',
      rank: 5,
      name: 'هنرستان دخترانه فاطمیه',
      subtitle: 'منطقه ۹ تهران',
      score: 12.5,
    },
  ],
  strongest: [
    {
      id: 'fake-school-s1',
      rank: 1,
      name: 'هنرستان فنی و حرفه‌ای البرز',
      subtitle: 'منطقه ۳ تهران',
      score: 19.5,
    },
    {
      id: 'fake-school-s2',
      rank: 2,
      name: 'دبیرستان نمونه دولتی شهید بهشتی',
      subtitle: 'منطقه ۶ تهران',
      score: 18.75,
    },
    {
      id: 'fake-school-s3',
      rank: 3,
      name: 'هنرستان دخترانه زینبیه',
      subtitle: 'منطقه ۲ تهران',
      score: 18.25,
    },
    {
      id: 'fake-school-s4',
      rank: 4,
      name: 'دبیرستان پسرانه علامه حلی',
      subtitle: 'منطقه ۷ تهران',
      score: 17.5,
    },
    {
      id: 'fake-school-s5',
      rank: 5,
      name: 'هنرستان کاردانش مفید',
      subtitle: 'منطقه ۱۱ تهران',
      score: 17,
    },
  ],
};
