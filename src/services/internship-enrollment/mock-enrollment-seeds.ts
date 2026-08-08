import type {
  InternshipMentorCapacity,
  InternshipSchoolCapacity,
  InternshipSupervisor,
} from '@/types/internship-enrollment';

export type SupervisorSeed = Omit<InternshipSupervisor, 'capacity'> & {
  totalCapacity: number | null;
};

export const SUPERVISOR_SEEDS: SupervisorSeed[] = [
  {
    id: 'sup-ahmadi',
    name: 'دکتر سارا احمدی',
    college: 'پردیس شهید باهنر تهران',
    province: 'تهران',
    day: 'شنبه',
    totalCapacity: 3,
  },
  {
    id: 'sup-rahimi',
    name: 'دکتر نادر رحیمی',
    college: 'پردیس شهید باهنر تهران',
    province: 'تهران',
    day: 'دوشنبه',
    totalCapacity: null,
  },
  {
    id: 'sup-farhadi',
    name: 'دکتر لیلا فرهادی',
    college: 'پردیس شهید باهنر اصفهان',
    province: 'اصفهان',
    day: 'سه‌شنبه',
    totalCapacity: 2,
  },
  {
    id: 'sup-readonly',
    name: 'دکتر مینا حیدری',
    college: 'پردیس شهید باهنر تهران',
    province: 'تهران',
    day: 'چهارشنبه',
    totalCapacity: 5,
    readOnly: true,
  },
  {
    id: 'sup-full',
    name: 'دکتر کامران حسینی',
    college: 'پردیس شهید باهنر تهران',
    province: 'تهران',
    day: 'پنج‌شنبه',
    totalCapacity: 0,
  },
];

export const SCHOOLS: InternshipSchoolCapacity[] = [
  {
    id: 'school-tehran-1',
    name: 'دبیرستان ماندگار البرز',
    province: 'تهران',
    district: 'ناحیه ۱ تهران',
    capacities: { 1: 4, 2: 4, 3: 4, 4: 4 },
  },
  {
    id: 'school-tehran-2',
    name: 'مدرسه فرهنگ',
    province: 'تهران',
    district: 'ناحیه ۲ تهران',
    capacities: { 1: null, 2: null, 3: null, 4: null },
  },
  {
    id: 'school-isfahan-1',
    name: 'دبیرستان سعدی',
    province: 'اصفهان',
    district: 'ناحیه ۱ اصفهان',
    capacities: { 1: 2, 2: 2, 3: 2, 4: 2 },
  },
];

export const MENTORS: InternshipMentorCapacity[] = [
  {
    id: 'mentor-tehran-1',
    name: 'آقای مرتضی ملکی',
    schoolId: 'school-tehran-1',
    capacities: { 1: 3, 2: 3, 3: 3, 4: 3 },
  },
  {
    id: 'mentor-tehran-2',
    name: 'خانم الهام جعفری',
    schoolId: 'school-tehran-2',
    capacities: { 1: null, 2: null, 3: null, 4: null },
  },
  {
    id: 'mentor-isfahan-1',
    name: 'آقای سعید نوری',
    schoolId: 'school-isfahan-1',
    capacities: { 1: 2, 2: 2, 3: 2, 4: 2 },
  },
];
