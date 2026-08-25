import type { DailyApprovalWeekState } from '@/types/daily-approvals';

export const TRAINEE_SEEDS = [
  { name: 'مریم احمدی', major: 'آموزش ابتدایی', school: 'دبیرستان ماندگار البرز' },
  { name: 'علی رضایی', major: 'آموزش ابتدایی', school: 'مدرسه فرهنگ' },
  { name: 'زهرا کریمی', major: 'آموزش ریاضی', school: 'دبیرستان سعدی' },
  { name: 'محمد حسینی', major: 'آموزش ابتدایی', school: 'دبیرستان ماندگار البرز' },
  { name: 'نگار محمدی', major: 'آموزش علوم', school: 'مدرسه فرهنگ' },
  { name: 'امیرحسین موسوی', major: 'آموزش ابتدایی', school: 'دبیرستان ماندگار البرز' },
  { name: 'فاطمه اکبری', major: 'آموزش فارسی', school: 'دبیرستان سعدی' },
  { name: 'سینا رحمانی', major: 'آموزش ابتدایی', school: 'مدرسه فرهنگ' },
  { name: 'هانیه جعفری', major: 'آموزش ابتدایی', school: 'دبیرستان ماندگار البرز' },
  { name: 'رضا صادقی', major: 'آموزش علوم', school: 'دبیرستان سعدی' },
  { name: 'سمیه نادری', major: 'آموزش ابتدایی', school: 'مدرسه فرهنگ' },
  { name: 'پارسا توکلی', major: 'آموزش ریاضی', school: 'دبیرستان ماندگار البرز' },
] as const;

export const WEEK_STATE_CYCLE: readonly DailyApprovalWeekState[] = [
  'graded',
  'approved',
  'pending',
  'needs_edit',
  'draft',
  'overdue',
  'locked_future',
  'extended',
];
