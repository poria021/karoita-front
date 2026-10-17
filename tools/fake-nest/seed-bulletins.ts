/** seed اطلاعیه/تبلیغ و استان‌ها (جدا تا import حلقه‌ای نشود). */
import { newId, type Store, type StoredBulletin } from './store';

const SEED_PROVINCES = ['تهران', 'قم', 'اصفهان', 'فارس', 'خراسان رضوی'];

/** همهٔ پنل‌ها جز ستاد — مخاطب تبلیغ مدیر ارشد. */
const ALL_PANELS = [
  'organization_center',
  'university_province',
  'university',
  'school_district',
  'school_admin',
  'mentor',
  'teacher',
  'student',
  'trainee',
];

/**
 * اطلاعیهٔ نمونه از هر پنل بالادست برای زیرمجموعه‌هایش، تا میز کار هر پنل
 * در real (روی سرور جعلی) هر دو باکس را پر نشان بدهد. مخاطب هر ردیف باید
 * زیرمجموعهٔ سلسله‌مراتب `ANNOUNCEMENT_AUDIENCE` در handlers/bulletins.ts باشد.
 */
const ANNOUNCEMENT_SEEDS: ReadonlyArray<{
  authorRole: string;
  authorName: string;
  audienceRoles: string[];
  title: string;
  body: string;
  hoursAgo: number;
  provinces?: string[];
}> = [
  {
    authorRole: 'superadmin',
    authorName: 'مدیر ارشد',
    audienceRoles: ['admin', ...ALL_PANELS],
    title: 'آغاز ثبت گزارش‌های روزانهٔ ترم جدید',
    body: 'ثبت گزارش روزانهٔ کارورزی و کارآموزی از ابتدای هفتهٔ آینده فعال می‌شود. لطفاً پروفایل خود را تکمیل کنید.',
    hoursAgo: 6,
    provinces: ['تهران', 'قم'],
  },
  {
    authorRole: 'organization_center',
    authorName: 'سازمان مرکزی',
    audienceRoles: ['university_province', 'university', 'school_district', 'mentor', 'student'],
    title: 'تقویم آموزشی نیم‌سال به‌روزرسانی شد',
    body: 'بازهٔ انتخاب واحد و فرجه‌های نیم‌سال جاری از سوی سازمان مرکزی تعیین و در سامانه ثبت شد.',
    hoursAgo: 10,
  },
  {
    authorRole: 'university_province',
    authorName: 'دانشگاه استان',
    audienceRoles: ['university', 'mentor', 'student'],
    title: 'جلسهٔ هماهنگی اساتید راهنما',
    body: 'جلسهٔ هماهنگی ماهانهٔ اساتید راهنما و دانشکده‌ها روز شنبه برگزار می‌شود.',
    hoursAgo: 14,
  },
  {
    authorRole: 'university',
    authorName: 'دانشکده',
    audienceRoles: ['mentor', 'student'],
    title: 'مهلت تکمیل پرونده‌های دانشجویی',
    body: 'دانشجویان تا پایان هفتهٔ جاری باید مدارک پروندهٔ کارورزی خود را تکمیل کنند.',
    hoursAgo: 18,
  },
  {
    authorRole: 'school_district',
    authorName: 'اداره آموزش و پرورش منطقه',
    audienceRoles: ['school_admin', 'teacher', 'trainee'],
    title: 'برنامهٔ بازدید منطقه‌ای از مدارس',
    body: 'بازدید منطقه‌ای از مدارس میزبان کارورز از هفتهٔ آینده آغاز می‌شود؛ مدیران هماهنگ باشند.',
    hoursAgo: 12,
  },
  {
    authorRole: 'school_admin',
    authorName: 'مدیر مدرسه',
    audienceRoles: ['teacher', 'trainee'],
    title: 'ساعت حضور کارورزان در مدرسه',
    body: 'حضور کارورزان از هفتهٔ آینده ساعت ۷:۳۰ صبح در دفتر مدرسه ثبت می‌شود.',
    hoursAgo: 20,
  },
  {
    authorRole: 'mentor',
    authorName: 'استاد راهنما',
    audienceRoles: ['student'],
    title: 'مهلت ارسال گزارش هفتگی',
    body: 'گزارش هفتگی هر هفته تا پایان روز پنجشنبه در سامانه ثبت شود.',
    hoursAgo: 22,
  },
  {
    authorRole: 'teacher',
    authorName: 'معلم راهنما',
    audienceRoles: ['trainee'],
    title: 'یادآوری تکمیل گزارش روزانه',
    body: 'گزارش روزانهٔ کارآموزی را همان روز پیش از ترک مدرسه ثبت کنید.',
    hoursAgo: 24,
  },
];

export function seedBulletinModule(store: Store): void {
  for (const title of SEED_PROVINCES) {
    const id = newId();
    store.provinces.set(id, { id, title });
  }

  const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

  const rows: StoredBulletin[] = [
    {
      id: newId(),
      kind: 'advertisement',
      title: 'وبینار آشنایی با سامانهٔ کارویتا',
      body: 'وبینار آموزشی کار با ماژول‌های گزارش روزانه و ارزیابی، ویژهٔ همهٔ کاربران سامانه.',
      authorRole: 'superadmin',
      authorName: 'مدیر ارشد',
      audienceRoles: ALL_PANELS,
      provinces: [],
      isActive: true,
      createdAt: hoursAgo(30),
      updatedAt: hoursAgo(30),
    },
    ...ANNOUNCEMENT_SEEDS.map(
      (seed): StoredBulletin => ({
        id: newId(),
        kind: 'announcement',
        title: seed.title,
        body: seed.body,
        authorRole: seed.authorRole,
        authorName: seed.authorName,
        audienceRoles: seed.audienceRoles,
        provinces: seed.provinces ?? [],
        isActive: true,
        createdAt: hoursAgo(seed.hoursAgo),
        updatedAt: hoursAgo(seed.hoursAgo),
      })
    ),
    {
      id: newId(),
      kind: 'advertisement',
      title: 'تبلیغ غیرفعال (فقط در صفحهٔ مدیریت دیده می‌شود)',
      body: 'این مورد برای دیدن حالت «غیرفعال» seed شده است.',
      authorRole: 'superadmin',
      authorName: 'مدیر ارشد',
      audienceRoles: ['student', 'mentor'],
      provinces: ['اصفهان'],
      isActive: false,
      createdAt: hoursAgo(48),
      updatedAt: hoursAgo(48),
    },
  ];
  store.bulletins.push(...rows);
}
