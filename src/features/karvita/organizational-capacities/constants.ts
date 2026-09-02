import type {
  OrganizationalCapacityKind,
  OrganizationalCapacityWeekday,
} from '@/types/organizational-capacities';

export const CAPACITY_KIND_TABS: readonly {
  value: OrganizationalCapacityKind;
  label: string;
}[] = [
  { value: 'internship', label: 'ظرفیت کارورزی' },
  { value: 'apprenticeship', label: 'ظرفیت کارآموزی' },
];

export const CAPACITY_FEATURE = {
  title: 'پیکربندی ظرفیت',
  description:
    'تعیین سقف پذیرش و روز حضور هفتگی برای دروس کارورزی و کارآموزی در نیم‌سال یا پودمان انتخاب‌شده در این بخش انجام می‌شود.',
} as const;

export const CAPACITY_WEEK_DAYS: readonly {
  value: OrganizationalCapacityWeekday;
  label: string;
  fullName: string;
}[] = [
  { value: 'sat', label: 'ش', fullName: 'شنبه' },
  { value: 'sun', label: 'ی', fullName: 'یکشنبه' },
  { value: 'mon', label: 'د', fullName: 'دوشنبه' },
  { value: 'tue', label: 'س', fullName: 'سه‌شنبه' },
  { value: 'wed', label: 'چ', fullName: 'چهارشنبه' },
  { value: 'thu', label: 'پ', fullName: 'پنجشنبه' },
];
