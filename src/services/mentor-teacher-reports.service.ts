import { IS_MOCK_MODE, throwRealModeNotImplemented } from '@/lib/api-mode';
import type {
  MentorReportsRole,
  MentorTeacherReportsSnapshot,
  MentorTeacherSummaryItem,
  MentorTeacherFeedbackItem,
  MentorTeacherStudentReport,
} from '@/types/mentor-teacher-reports';

const summary: MentorTeacherSummaryItem[] = [
  { label: 'گزارش‌های ارسال‌شده', value: '۱۸', meta: 'از ۲۴ مورد', tone: 'brand' },
  { label: 'در انتظار بازبینی', value: '۴', meta: 'برای هفته جاری', tone: 'info' },
  { label: 'نیازمند اصلاح', value: '۲', meta: 'بازخورد ثبت شد', tone: 'warning' },
  { label: 'میانگین نمره', value: '۸۶', meta: 'از ۱۰۰', tone: 'success' },
];

const students: MentorTeacherStudentReport[] = [
  {
    id: 's-1',
    name: 'سارا محمدی',
    school: 'دبیرستان انرژی',
    course: 'کارورزی ۲',
    week: 'هفته ۵',
    status: 'approved',
    score: 92,
    updatedAt: '۲ ساعت پیش',
  },
  {
    id: 's-2',
    name: 'امیررضا نیک‌زاد',
    school: 'دبیرستان حافظ',
    course: 'کارورزی ۲',
    week: 'هفته ۵',
    status: 'pending',
    score: 84,
    updatedAt: '۴ ساعت پیش',
  },
  {
    id: 's-3',
    name: 'نیلوفر عباسی',
    school: 'دبیرستان فرزانگان',
    course: 'کارورزی ۲',
    week: 'هفته ۴',
    status: 'revision',
    score: 68,
    updatedAt: 'دیروز',
  },
  {
    id: 's-4',
    name: 'پارسا علوی',
    school: 'دبیرستان پیام',
    course: 'کارورزی ۳',
    week: 'هفته ۶',
    status: 'pending',
    score: 79,
    updatedAt: '۲ روز پیش',
  },
];

const feedback: MentorTeacherFeedbackItem[] = [
  {
    id: 'f-1',
    title: 'بازخورد به‌روز',
    body: 'کدهای اجرایی گزارش حفظ شده‌اند و نیاز به توضیح بیشتر در بخش تحلیل فقط برای یک مورد وجود دارد.',
    author: 'معلم راهنما · زهرا احمدی',
    time: '۳ ساعت پیش',
  },
  {
    id: 'f-2',
    title: 'نکته کلاس درس',
    body: 'سازگاری بین اهداف آموزشی و تجربهٔ انجام‌شده در کلاس خوب است؛ برای هفته آینده تمرکز روی ارزیابی عملکرد را بیشتر کنید.',
    author: 'مدیر مدرسه · نرگس احمدی',
    time: 'دیروز',
  },
  {
    id: 'f-3',
    title: 'پیگیری لازم',
    body: 'محتوای گزارش باید به زبان ساده‌تر بازنویسی شود تا ارزش تجربهٔ عملی بهتر دیده شود.',
    author: 'استاد راهنما · دکتر هانیه کاظمی',
    time: '۱ هفته پیش',
  },
];

export const mockMentorTeacherReports: MentorTeacherReportsSnapshot = {
  summary,
  students,
  feedback,
};

export const MentorTeacherReportsService = {
  async listReports(
    role: MentorReportsRole = 'mentor_teacher'
  ): Promise<MentorTeacherReportsSnapshot> {
    if (IS_MOCK_MODE) {
      return {
        ...mockMentorTeacherReports,
        summary:
          role === 'supervisor_professor'
            ? [
                { label: 'گزارش‌های تأییدشده', value: '۲۱', meta: 'از ۲۸ مورد', tone: 'brand' },
                { label: 'در انتظار ارزیابی', value: '۵', meta: 'برای این هفته', tone: 'info' },
                { label: 'نیازمند پیگیری', value: '۳', meta: 'بازخورد ثبت شد', tone: 'warning' },
                { label: 'میانگین نمره', value: '۸۹', meta: 'از ۱۰۰', tone: 'success' },
              ]
            : role === 'school_principal'
              ? [
                  { label: 'گزارش‌های نهایی', value: '۲۴', meta: 'از ۳۲ مورد', tone: 'brand' },
                  { label: 'در انتظار تأیید', value: '۴', meta: 'برای هفته جاری', tone: 'info' },
                  { label: 'نیازمند اصلاح', value: '۲', meta: 'در فرایند بازبینی', tone: 'warning' },
                  { label: 'میانگین نمره مدرسه', value: '۸۸', meta: 'از ۱۰۰', tone: 'success' },
                ]
              : role === 'regional_edu_admin'
                ? [
                    { label: 'مدارس تحت پوشش', value: '۱۲', meta: 'در این منطقه', tone: 'brand' },
                    { label: 'گزارش‌های تکمیل‌شده', value: '۸۷', meta: 'از ۱۱۰ مورد', tone: 'success' },
                    { label: 'در انتظار پیگیری', value: '۹', meta: 'توسط مدارس', tone: 'warning' },
                    { label: 'نرخ پایش', value: '۷۹', meta: 'درصد', tone: 'info' },
                  ]
                : role === 'faculty_role'
                  ? [
                      { label: 'مدارس تابعه', value: '۸', meta: 'در این پردیس', tone: 'brand' },
                      { label: 'تکمیل گزارش‌ها', value: '۹۲', meta: 'درصد اتفاق افتاده', tone: 'success' },
                      { label: 'پرسش‌های باز', value: '۶', meta: 'در حال پیگیری', tone: 'warning' },
                      { label: 'میانگین ارزیابی', value: '۸۷', meta: 'از ۱۰۰', tone: 'info' },
                    ]
                  : role === 'super_admin' || role === 'assistant_admin'
                    ? [
                        { label: 'واحدهای تحت پوشش', value: '۵۶', meta: 'در سطح کشور', tone: 'brand' },
                        { label: 'نرخ تکمیل گزارش‌ها', value: '۹۵', meta: 'درصد', tone: 'success' },
                        { label: 'در پیگیری ستادی', value: '۱۲', meta: 'نیازمند هماهنگی', tone: 'warning' },
                        { label: 'شاخص مدیر ارشد', value: '۹۳', meta: 'از ۱۰۰', tone: 'info' },
                      ]
                    : role === 'central_organization'
                      ? [
                          { label: 'واحدهای تحت پوشش', value: '۴۸', meta: 'در سطح کشور', tone: 'brand' },
                          { label: 'نرخ تکمیل گزارش‌ها', value: '۹۳', meta: 'درصد', tone: 'success' },
                          { label: 'در پیگیری ستادی', value: '۱۴', meta: 'نیازمند هماهنگی', tone: 'warning' },
                          { label: 'شاخص کلان', value: '۹۱', meta: 'از ۱۰۰', tone: 'info' },
                        ]
                      : role === 'provincial_university'
                      ? [
                          { label: 'پردیس‌های تحت پوشش', value: '۲۵', meta: 'در استان', tone: 'brand' },
                          { label: 'نرخ تکمیل', value: '۹۱', meta: 'درصد', tone: 'success' },
                          { label: 'مدارس در پیگیری', value: '۱۱', meta: 'نیازمند هماهنگی', tone: 'warning' },
                          { label: 'شاخص منطقه‌ای', value: '۸۹', meta: 'از ۱۰۰', tone: 'info' },
                        ]
                      : mockMentorTeacherReports.summary,
        students:
          role === 'supervisor_professor'
            ? [
                {
                  id: 's-11',
                  name: 'مهدی روحانی',
                  school: 'دبیرستان نوآور',
                  course: 'کارورزی ۲',
                  week: 'هفته ۵',
                  status: 'approved',
                  score: 94,
                  updatedAt: '۱ ساعت پیش',
                },
                {
                  id: 's-12',
                  name: 'فاطمه کمالی',
                  school: 'دبیرستان آوای مهر',
                  course: 'کارورزی ۲',
                  week: 'هفته ۵',
                  status: 'pending',
                  score: 82,
                  updatedAt: '۳ ساعت پیش',
                },
                {
                  id: 's-13',
                  name: 'یاسر صفوی',
                  school: 'دبیرستان فرشته',
                  course: 'کارورزی ۳',
                  week: 'هفته ۶',
                  status: 'revision',
                  score: 71,
                  updatedAt: 'دیروز',
                },
              ]
            : role === 'school_principal'
              ? [
                  {
                    id: 's-21',
                    name: 'علی سلیمانی',
                    school: 'دبیرستان شاهد',
                    course: 'کارورزی ۲',
                    week: 'هفته ۵',
                    status: 'approved',
                    score: 95,
                    updatedAt: '۲ ساعت پیش',
                  },
                  {
                    id: 's-22',
                    name: 'نیلوفر حسین‌زاده',
                    school: 'دبیرستان مهر',
                    course: 'کارورزی ۳',
                    week: 'هفته ۶',
                    status: 'pending',
                    score: 83,
                    updatedAt: '۴ ساعت پیش',
                  },
                  {
                    id: 's-23',
                    name: 'سعید صفری',
                    school: 'دبیرستان فرزانگان',
                    course: 'کارورزی ۲',
                    week: 'هفته ۴',
                    status: 'revision',
                    score: 70,
                    updatedAt: 'دیروز',
                  },
                ]
              : role === 'regional_edu_admin'
                ? [
                    {
                      id: 's-31',
                      name: 'پریسا قاسمی',
                      school: 'دبیرستان مهرآباد',
                      course: 'کارورزی ۲',
                      week: 'هفته ۶',
                      status: 'approved',
                      score: 91,
                      updatedAt: '۳ ساعت پیش',
                    },
                    {
                      id: 's-32',
                      name: 'آرمان آقایی',
                      school: 'دبیرستان شهید باهنر',
                      course: 'کارورزی ۳',
                      week: 'هفته ۵',
                      status: 'pending',
                      score: 80,
                      updatedAt: '۵ ساعت پیش',
                    },
                    {
                      id: 's-33',
                      name: 'سارا نادری',
                      school: 'دبیرستان معلم',
                      course: 'کارورزی ۲',
                      week: 'هفته ۴',
                      status: 'revision',
                      score: 72,
                      updatedAt: 'دیروز',
                    },
                  ]
                : role === 'faculty_role'
                  ? [
                      {
                        id: 's-41',
                        name: 'مهدی نوری',
                        school: 'دبیرستان یاس',
                        course: 'کارورزی ۲',
                        week: 'هفته ۵',
                        status: 'approved',
                        score: 90,
                        updatedAt: '۲ ساعت پیش',
                      },
                      {
                        id: 's-42',
                        name: 'رضا پارسا',
                        school: 'دبیرستان شفا',
                        course: 'کارورزی ۳',
                        week: 'هفته ۶',
                        status: 'pending',
                        score: 82,
                        updatedAt: '۴ ساعت پیش',
                      },
                      {
                        id: 's-43',
                        name: 'نگار رحیمی',
                        school: 'دبیرستان شریعتی',
                        course: 'کارورزی ۲',
                        week: 'هفته ۴',
                        status: 'revision',
                        score: 74,
                        updatedAt: 'دیروز',
                      },
                    ]
                  : role === 'super_admin' || role === 'assistant_admin'
                    ? [
                        {
                          id: 's-51',
                          name: 'سعید نادری',
                          school: 'ستاد مرکزی آموزش کشور',
                          course: 'آمار کلان عملکرد',
                          week: 'هفته ۶',
                          status: 'approved',
                          score: 97,
                          updatedAt: '۱ ساعت پیش',
                        },
                        {
                          id: 's-52',
                          name: 'مریم عطایی',
                          school: 'مرکز هماهنگی مناطق',
                          course: 'نرخ تکمیل سازمانی',
                          week: 'هفته ۵',
                          status: 'pending',
                          score: 89,
                          updatedAt: '۴ ساعت پیش',
                        },
                        {
                          id: 's-53',
                          name: 'امیر اسلامی',
                          school: 'دفتر ارزیابی ستادی',
                          course: 'شاخص‌های مدیریتی',
                          week: 'هفته ۴',
                          status: 'revision',
                          score: 81,
                          updatedAt: 'دیروز',
                        },
                      ]
                    : role === 'central_organization'
                      ? [
                          {
                            id: 's-61',
                            name: 'سید محمد رضوی',
                            school: 'مرکز آموزش فنی کشور',
                            course: 'کارورزی ۲',
                            week: 'هفته ۶',
                            status: 'approved',
                            score: 95,
                            updatedAt: '۲ ساعت پیش',
                          },
                          {
                            id: 's-62',
                            name: 'زینب مهدوی',
                            school: 'دانشکده کشاورزی مرکزی',
                            course: 'کارورزی ۳',
                            week: 'هفته ۵',
                            status: 'pending',
                            score: 86,
                            updatedAt: '۵ ساعت پیش',
                          },
                          {
                            id: 's-63',
                            name: 'رضا فرهادی',
                            school: 'مرکز پژوهش‌های ملی',
                            course: 'کارورزی ۲',
                            week: 'هفته ۴',
                            status: 'revision',
                            score: 78,
                            updatedAt: 'دیروز',
                          },
                        ]
                      : role === 'provincial_university'
                      ? [
                          {
                            id: 's-61',
                            name: 'زهرا امیدی',
                            school: 'دانشکده فنی استان',
                            course: 'کارورزی ۲',
                            week: 'هفته ۶',
                            status: 'approved',
                            score: 93,
                            updatedAt: '۳ ساعت پیش',
                          },
                          {
                            id: 's-62',
                            name: 'حسن قلی‌پور',
                            school: 'دانشکده کشاورزی',
                            course: 'کارورزی ۳',
                            week: 'هفته ۵',
                            status: 'pending',
                            score: 84,
                            updatedAt: '۶ ساعت پیش',
                          },
                          {
                            id: 's-63',
                            name: 'لیلا حسینی',
                            school: 'پردیس علمی',
                            course: 'کارورزی ۲',
                            week: 'هفته ۴',
                            status: 'revision',
                            score: 76,
                            updatedAt: 'دیروز',
                          },
                        ]
                      : mockMentorTeacherReports.students,
        feedback:
          role === 'supervisor_professor'
            ? [
                {
                  id: 'f-11',
                  title: 'بازخورد عملکرد',
                  body: 'روند رشد دانشجو در گزارش‌های اخیر روند مثبتی دارد و لازم است در بخش هدف‌گذاری جزئیات بیشتری درج شود.',
                  author: 'استاد راهنما · دکتر محمدی',
                  time: '۲ ساعت پیش',
                },
                {
                  id: 'f-12',
                  title: 'پیگیری آموزشی',
                  body: 'ارتباط میان فعالیت‌های عملی و اهداف آموزشی به‌خوبی شکل گرفته است؛ ادامهٔ همین رویکرد را حفظ کنید.',
                  author: 'معلم راهنما · مهسا رضایی',
                  time: 'دیروز',
                },
              ]
            : role === 'school_principal'
              ? [
                  {
                    id: 'f-21',
                    title: 'بازبینی نهایی مدرسه',
                    body: 'در سطح مدرسه، روند تحویل گزارش‌ها در سطح مطلوب است و لازم است برای چهار دانشجو نهایی‌سازی نمره‌ها انجام شود.',
                    author: 'مدیر مدرسه · نرگس احمدی',
                    time: '۱ ساعت پیش',
                  },
                  {
                    id: 'f-22',
                    title: 'پیگیری تیم آموزشی',
                    body: 'در بخش تحلیل عملکرد، توضیح‌های آموزشی باید با معیارهای مدرسه هم‌راستا و شفاف‌تر نوشته شود.',
                    author: 'معلم راهنما · زهرا احمدی',
                    time: 'دیروز',
                  },
                ]
              : role === 'regional_edu_admin'
                ? [
                    {
                      id: 'f-31',
                      title: 'بازبینی منطقه‌ای',
                      body: 'سه مدرسه از سطح منطقه به‌صورت کامل گزارش‌ها را ثبت کرده‌اند. دو مدرسه با تأخیر در تکمیل گزارش‌ها هستند.',
                      author: 'آموزش و پرورش منطقه · مریم شهریاری',
                      time: '۲ ساعت پیش',
                    },
                    {
                      id: 'f-32',
                      title: 'تمرکز روی کیفیت',
                      body: 'در چند مدرسه، تحلیل گزارش‌ها باید با معیارهای استاندارد منطقه‌ای هم‌راستا‌تر شود.',
                      author: 'مدیر مدرسه · علیرضا امیدی',
                      time: 'دیروز',
                    },
                  ]
                : role === 'faculty_role'
                  ? [
                      {
                        id: 'f-41',
                        title: 'بازبینی پردیس',
                        body: 'سه مدرسه تابعه گزارش‌های خود را به‌صورت کامل ثبت کردند و دو مدرسه در حال تکمیل نهایی هستند.',
                        author: 'مدیر دانشکده · دکتر سادات',
                        time: '۳ ساعت پیش',
                      },
                      {
                        id: 'f-42',
                        title: 'نکته اجرایی',
                        body: 'در برخی گزارش‌ها، کیفیت تحلیل عملکرد باید با معیارهای آموزشی پردیس هم‌راستا‌تر شود.',
                        author: 'معلم راهنما · فرزانه ایزدی',
                        time: 'دیروز',
                      },
                    ]
                  : role === 'super_admin' || role === 'assistant_admin'
                    ? [
                        {
                          id: 'f-51',
                          title: 'مرور مدیر ارشد',
                          body: 'شاخص‌های کلان نظام در سطح مطلوب قرار دارند و بازخوردهای ستادی نشان می‌دهد هماهنگی بین مناطق و مراکز آموزشی در سطح مطلوبی حفظ شده است.',
                          author: 'مدیر ارشد · دکتر نوری',
                          time: '۱ ساعت پیش',
                        },
                        {
                          id: 'f-52',
                          title: 'تصمیم‌گیری ستادی',
                          body: 'در ارزیابی‌های اخیر، تمرکز اصلی بر بهبود یکپارچگی گزارش‌های مناطق و کاهش تأخیر در بازبینی‌های سطح کشور بوده است.',
                          author: 'دستیار مدیر ارشد · مهسا نوروزی',
                          time: 'دیروز',
                        },
                      ]
                    : role === 'central_organization'
                      ? [
                          {
                            id: 'f-61',
                            title: 'مرور ستادی',
                            body: 'در سطح کشور، نرخ تکمیل گزارش‌ها بالاتر از هدف است و هماهنگی بین مناطق و پردیس‌ها در سطح خوبی قرار دارد.',
                            author: 'سازمان مرکزی · دکتر سلیمانی',
                            time: '۱ ساعت پیش',
                          },
                          {
                            id: 'f-62',
                            title: 'هماهنگی کلان',
                            body: 'برای ایجاد هم‌راستایی بیشتر در ارزیابی‌ها، استانداردهای ستادی باید در سطح مناطق و دانشگاه‌ها به‌صورت دقیق‌تر اعمال شود.',
                            author: 'مدیر ستادی · دکتر فرهادی',
                            time: 'دیروز',
                          },
                        ]
                      : role === 'provincial_university'
                      ? [
                          {
                            id: 'f-61',
                            title: 'مرور استان',
                            body: 'در سطح استان، نرخ تکمیل گزارش‌ها رو به رشد است اما چند پردیس در ثبت نهایی نیاز به هماهنگی دارند.',
                            author: 'دانشگاه استانی · دکتر شریعتی',
                            time: '۱ ساعت پیش',
                          },
                          {
                            id: 'f-62',
                            title: 'هماهنگی دانشگاهی',
                            body: 'برای بهبود هم‌راستایی ارزیابی‌ها، استانداردهای سطح استان باید در گزارش‌های مدارس تابعه دقیق‌تر اعمال شود.',
                            author: 'مدیر دانشکده · دکتر حمیدی',
                            time: 'دیروز',
                          },
                        ]
                      : mockMentorTeacherReports.feedback,
      };
    }

    throwRealModeNotImplemented('MentorTeacherReportsService.listReports');
  },
};
