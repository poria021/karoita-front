function karvitaApp() {
  const categories = [
    { id: 'C1_trainee', label: 'فراگیران و حضور', blurb: 'لیست، کارنامه، آپلود، تأخیر، حضور', icon: 'fa-user-graduate' },
    { id: 'C2_grades', label: 'نمرات و بازخورد', blurb: 'پایانی، بازخورد فعالیت، تفکیک استاد', icon: 'fa-graduation-cap' },
    { id: 'C3_staff_schools', label: 'مدارس و کادر', blurb: 'مدارس، کادر، عملکرد، بازدید', icon: 'fa-school' },
    { id: 'C4_governance', label: 'حاکمیت و ظرفیت', blurb: 'افزونه خارج از سند مهر', icon: 'fa-chart-pie' },
  ];

  const roleNames = {
    student: 'کارورز / دانشجو', skill_learner: 'مهارت‌آموز', mentor_teacher: 'معلم راهنما',
    school_principal: 'مدیر مدرسه', supervisor_professor: 'استاد راهنما', regional_edu_admin: 'مدیر منطقه',
    edu_general_admin: 'اداره کل', faculty_role: 'رئیس دانشکده', provincial_university: 'دانشگاه استانی',
    central_organization: 'سازمان مرکزی', assistant_admin: 'دستیار مدیر', super_admin: 'مدیر ارشد',
  };

  const F = {
    termId: { key: 'termId', label: 'ترم / پودمان', type: 'select', options: ['نیم‌سال دوم ۱۴۰۵-۱۴۰۶', 'نیم‌سال اول ۱۴۰۵-۱۴۰۶', 'پودمان چهارم'] },
    audience: { key: 'audience', label: 'نظام آموزشی', type: 'select', options: ['ترمی', 'پودمانی'] },
    courseId: { key: 'courseId', label: 'عنوان درس', type: 'select', options: ['کارورزی ۱', 'کارورزی ۲', 'کارآموزی ۱'] },
    provinceId: { key: 'provinceId', label: 'استان', type: 'select', options: ['تهران', 'اصفهان', 'فارس'] },
    cityId: { key: 'cityId', label: 'شهر', type: 'select', options: ['تهران', 'ری', 'اصفهان'] },
    districtId: { key: 'districtId', label: 'منطقه', type: 'select', options: ['ناحیه ۱', 'ناحیه ۲'] },
    schoolId: { key: 'schoolId', label: 'مدرسه', type: 'select', options: ['البرز', 'فجر', 'بهشتی'] },
    collegeId: { key: 'collegeId', label: 'دانشکده', type: 'select', options: ['پردیس باهنر', 'پردیس شرافت'] },
    majorId: { key: 'majorId', label: 'رشته', type: 'select', options: ['آموزش ابتدایی', 'مهارت‌آموزی'] },
    mentorId: { key: 'mentorId', label: 'معلم راهنما', type: 'select', options: ['مرتضی ملکی', 'سارا اکبری'] },
    principalId: { key: 'principalId', label: 'مدیر مدرسه', type: 'select', options: ['عباس پناهی', 'حسن رضایی'] },
    supervisorId: { key: 'supervisorId', label: 'استاد راهنما', type: 'select', options: ['دکتر کریمی', 'دکتر رضایی'] },
    traineeId: { key: 'traineeId', label: 'فراگیر', type: 'text' },
    gender: { key: 'gender', label: 'جنسیت مدرسه', type: 'select', options: ['پسرانه', 'دخترانه'] },
    weekday: { key: 'weekday', label: 'روز کارورزی', type: 'select', options: ['شنبه', 'یکشنبه', 'دوشنبه'] },
    dateFrom: { key: 'dateFrom', label: 'از تاریخ', type: 'text' },
    dateTo: { key: 'dateTo', label: 'تا تاریخ', type: 'text' },
    minScore: { key: 'minScore', label: 'حداقل نمره', type: 'text' },
    maxScore: { key: 'maxScore', label: 'حداکثر نمره', type: 'text' },
    weekStatus: { key: 'weekStatus', label: 'وضعیت هفته', type: 'select', options: ['ارسال‌شده', 'معوق', 'تمدیدشده'] },
    feedbackRole: { key: 'feedbackRole', label: 'نقش بازخورد', type: 'select', options: ['معلم', 'مدیر', 'استاد'] },
    minTrainees: { key: 'minTrainees', label: 'حداقل کارورز', type: 'text' },
  };

  const catalog = [
    { id: 'trainee_transcript', title: 'کارنامه', category: 'C1_trainee', icon: 'fa-id-card',
      summary: 'پرونده هفتگی ارزیابی یک فراگیر (سند مهر)', comparable: false, grain: 'WeekActivity',
      filters: ['termId', 'traineeId'],
      columns: [
        { key: 'weekNo', label: 'هفته' }, { key: 'mentorRating', label: 'نمره معلم راهنما' }, { key: 'mentorFeedback', label: 'بازخورد معلم راهنما' },
        { key: 'principalRating', label: 'نمره مدیر' }, { key: 'principalFeedback', label: 'بازخورد مدیر' },
        { key: 'supervisorScore', label: 'نمره استاد راهنما' }, { key: 'supervisorFeedback', label: 'بازخورد استاد راهنما' },
        { key: 'total20', label: 'نمره کل از ۲۰' }, { key: 'filesCount', label: 'پیوست' },
      ],
      roleLabels: {
        student: 'کارنامه', skill_learner: 'کارنامه',
        supervisor_professor: 'گزارش کارنامه فردی',
        super_admin: 'گزارش کارنامه فردی', assistant_admin: 'گزارش کارنامه فردی',
      },
      roleColumns: {
        student: ['weekNo', 'mentorRating', 'mentorFeedback', 'principalRating', 'principalFeedback', 'supervisorScore', 'supervisorFeedback', 'total20', 'filesCount'],
        skill_learner: ['weekNo', 'mentorRating', 'mentorFeedback', 'principalRating', 'principalFeedback', 'supervisorScore', 'supervisorFeedback', 'total20', 'filesCount'],
        supervisor_professor: ['weekNo', 'mentorRating', 'mentorFeedback', 'principalRating', 'principalFeedback', 'supervisorScore', 'total20', 'filesCount'],
      },
      rows: [
        { weekNo: '۱', mentorRating: '۴.۵', mentorFeedback: 'عملکرد خوب', principalRating: '۵', principalFeedback: 'حضور منظم', supervisorScore: '۹۰', supervisorFeedback: 'قابل قبول', total20: '۱۸.۵', filesCount: '۲' },
        { weekNo: '۲', mentorRating: '۴', mentorFeedback: 'نیاز به پیگیری', principalRating: '۴.۵', principalFeedback: 'قابل قبول', supervisorScore: '۸۵', supervisorFeedback: 'بهبود لازم', total20: '۱۷', filesCount: '۱' },
      ] },

    { id: 'trainee_list', title: 'لیست کارورزان', category: 'C1_trainee', icon: 'fa-users',
      summary: 'شناسنامه فراگیران — ستون‌ها و فیلترها مطابق تفکیک سند مهر برای هر نقش', comparable: true,
      compareHint: 'مدارس یا استادان را مقایسه کنید', grain: 'TraineeRoster',
      filters: ['termId', 'audience', 'courseId', 'provinceId', 'cityId', 'districtId', 'schoolId', 'collegeId', 'majorId', 'mentorId', 'supervisorId', 'principalId', 'weekday', 'traineeId'],
      columns: [
        { key: 'name', label: 'نام کارورز' }, { key: 'code', label: 'شناسه' },
        { key: 'termTitle', label: 'دوره تحصیلی' }, { key: 'courseTitle', label: 'درس / دوره' },
        { key: 'college', label: 'دانشکده' }, { key: 'major', label: 'رشته تحصیلی' },
        { key: 'province', label: 'استان' }, { key: 'city', label: 'شهر' }, { key: 'district', label: 'منطقه' },
        { key: 'school', label: 'مدرسه' }, { key: 'principalName', label: 'مدیر مدرسه' },
        { key: 'mentorName', label: 'معلم راهنما' }, { key: 'supervisorName', label: 'استاد راهنما' },
        { key: 'internshipDays', label: 'روز کارورزی' },
      ],
      roleLabels: {
        mentor_teacher: 'لیست کارورزان تحت راهنمایی',
        school_principal: 'لیست کارورزان فعال در مدرسه به تفکیک روز کارورزی، دانشکده، رشته تحصیلی، استاد راهنما و معلم راهنما',
        regional_edu_admin: 'لیست کارورزان فعال در مدرسه به تفکیک روز کارورزی، دانشکده، رشته تحصیلی، استاد راهنما و معلم راهنما',
        edu_general_admin: 'لیست کارورزان فعال به تفکیک شهر/ منطقه، مدرسه، مدیر و معلم راهنما',
        faculty_role: 'لیست کارورزان تفکیک  استان، شهر/منطقه، مدرسه، دوره تحصیلی، استاد راهنما، مدیر مدرسه، معلم راهنما',
        provincial_university: 'لیست کارورزان تفکیک شهر/منطقه، مدرسه، دوره تحصیلی، استاد راهنما، مدیر مدرسه، معلم راهنما',
        central_organization: 'لیست کارورزان تفکیک استان، شهر/منطقه، مدرسه، دوره تحصیلی، استاد راهنما، مدیر مدرسه، معلم راهنما',
        supervisor_professor: 'لیست کارورزان به تفکیک استان، شهر منطقه، مدرسه و معلم راهنما',
        super_admin: 'لیست کارورزان تفکیک استان، شهر/منطقه، مدرسه، دوره تحصیلی، استاد راهنما، مدیر مدرسه، معلم راهنما',
        assistant_admin: 'لیست کارورزان تفکیک استان، شهر/منطقه، مدرسه، دوره تحصیلی، استاد راهنما، مدیر مدرسه، معلم راهنما',
      },
      roleColumns: {
        mentor_teacher: ['name', 'code', 'termTitle', 'courseTitle', 'major', 'internshipDays', 'school'],
        school_principal: ['name', 'code', 'internshipDays', 'college', 'major', 'supervisorName', 'mentorName'],
        regional_edu_admin: ['name', 'code', 'school', 'internshipDays', 'college', 'major', 'supervisorName', 'mentorName'],
        edu_general_admin: ['name', 'code', 'city', 'district', 'school', 'principalName', 'mentorName'],
        faculty_role: ['name', 'code', 'province', 'city', 'district', 'school', 'termTitle', 'supervisorName', 'principalName', 'mentorName'],
        provincial_university: ['name', 'code', 'city', 'district', 'school', 'termTitle', 'supervisorName', 'principalName', 'mentorName'],
        central_organization: ['name', 'code', 'province', 'city', 'district', 'school', 'termTitle', 'supervisorName', 'principalName', 'mentorName'],
        supervisor_professor: ['name', 'code', 'province', 'city', 'district', 'school', 'mentorName'],
        super_admin: ['name', 'code', 'province', 'city', 'district', 'school', 'termTitle', 'college', 'supervisorName', 'principalName', 'mentorName'],
        assistant_admin: ['name', 'code', 'province', 'city', 'district', 'school', 'termTitle', 'college', 'supervisorName', 'principalName', 'mentorName'],
      },
      rows: [
        { name: '<b>امیرحسین کریمی</b>', code: '۴۰۱۲۳۴۵۶۷', termTitle: 'نیم‌سال ۲', courseTitle: 'کارورزی ۲', college: 'باهنر', major: 'آموزش ابتدایی', province: 'تهران', city: 'تهران', district: 'ناحیه ۱', school: 'البرز', principalName: 'عباس پناهی', mentorName: 'مرتضی ملکی', supervisorName: 'دکتر کریمی', internshipDays: 'شنبه' },
        { name: '<b>سارا محمدی</b>', code: '۴۰۱۲۳۴۵۶۸', termTitle: 'نیم‌سال ۲', courseTitle: 'کارورزی ۲', college: 'باهنر', major: 'آموزش ابتدایی', province: 'تهران', city: 'تهران', district: 'ناحیه ۲', school: 'فجر', principalName: 'حسن رضایی', mentorName: 'سارا اکبری', supervisorName: 'دکتر کریمی', internshipDays: 'یکشنبه' },
        { name: '<b>علی نوری</b>', code: '۴۰۱۹۸۷۶۵۴', termTitle: 'پودمان ۴', courseTitle: 'کارآموزی ۱', college: 'باهنر', major: 'مهارت‌آموزی', province: 'تهران', city: 'ری', district: 'ناحیه ۱', school: 'بهشتی', principalName: 'محمد کاظمی', mentorName: 'رضا کاظمی', supervisorName: 'دکتر رضایی', internshipDays: 'دوشنبه' },
      ] },

    { id: 'attendance_days', title: 'گزارش روزهای حضور', category: 'C1_trainee', icon: 'fa-calendar-check',
      summary: 'حضور/عدم حضور تأییدشده توسط مدیر مدرسه', comparable: true, grain: 'WeekActivity',
      filters: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'schoolId', 'traineeId', 'dateFrom', 'dateTo'],
      columns: [
        { key: 'traineeName', label: 'کارورز' }, { key: 'code', label: 'شناسه' },
        { key: 'province', label: 'استان' }, { key: 'city', label: 'شهر' }, { key: 'district', label: 'منطقه' },
        { key: 'college', label: 'دانشکده' }, { key: 'school', label: 'مدرسه' },
        { key: 'presentDaysCount', label: 'روز حضور' }, { key: 'absentDaysCount', label: 'روز عدم حضور' }, { key: 'term', label: 'دوره' },
      ],
      roleLabels: {
        student: 'گزارش روزهای حضور', skill_learner: 'گزارش روزهای حضور',
        school_principal: 'لیست تعداد روزهای حضوریا عدم حضور دانشجو در مدرسه تایید شده توسط مدیر',
        supervisor_professor: 'لیست تعداد روزهای حضوریا عدم حضور دانشجو در مدرسه تایید شده توسط مدیر',
        faculty_role: 'لیست حضور یا عدم حضور کارورزان تایید شده توسط مدیر مدرسه',
        provincial_university: 'لیست حضور یا عدم حضور کارورزان تایید شده توسط مدیر مدرسه به تفکیک دانشکده',
        central_organization: 'لیست حضور یا عدم حضور کارورزان تایید شده توسط مدیر مدرسه به تفکیک استان،شهر، منطقه، دانشکده',
        super_admin: 'لیست حضور یا عدم حضور کارورزان تایید شده توسط مدیر مدرسه به تفکیک استان،شهر، منطقه، دانشکده',
        assistant_admin: 'لیست حضور یا عدم حضور کارورزان تایید شده توسط مدیر مدرسه به تفکیک استان،شهر، منطقه، دانشکده',
      },
      roleColumns: {
        student: ['term', 'presentDaysCount', 'absentDaysCount'],
        skill_learner: ['term', 'presentDaysCount', 'absentDaysCount'],
        school_principal: ['traineeName', 'code', 'presentDaysCount', 'absentDaysCount', 'term'],
        supervisor_professor: ['traineeName', 'code', 'school', 'presentDaysCount', 'absentDaysCount', 'term'],
        faculty_role: ['traineeName', 'code', 'school', 'presentDaysCount', 'absentDaysCount', 'term'],
        provincial_university: ['traineeName', 'code', 'college', 'school', 'presentDaysCount', 'absentDaysCount', 'term'],
        central_organization: ['traineeName', 'code', 'province', 'city', 'district', 'college', 'school', 'presentDaysCount', 'absentDaysCount', 'term'],
        super_admin: ['traineeName', 'code', 'province', 'city', 'district', 'college', 'school', 'presentDaysCount', 'absentDaysCount', 'term'],
        assistant_admin: ['traineeName', 'code', 'province', 'city', 'district', 'college', 'school', 'presentDaysCount', 'absentDaysCount', 'term'],
      },
      rows: [
        { traineeName: 'امیرحسین کریمی', code: '۴۰۱۲۳۴۵۶۷', province: 'تهران', city: 'تهران', district: 'ناحیه ۱', college: 'باهنر', school: 'البرز', presentDaysCount: '۱۲', absentDaysCount: '۱', term: 'نیم‌سال ۲' },
        { traineeName: 'سارا محمدی', code: '۴۰۱۲۳۴۵۶۸', province: 'تهران', city: 'تهران', district: 'ناحیه ۲', college: 'باهنر', school: 'فجر', presentDaysCount: '۱۰', absentDaysCount: '۲', term: 'نیم‌سال ۲' },
      ] },

    { id: 'student_uploads', title: 'لیست فعالیت‌های بارگذاری شده توسط دانشجو', category: 'C1_trainee', icon: 'fa-cloud-arrow-up',
      summary: 'فایل‌های گزارش هفتگی دانشجو — استاد راهنما', comparable: true, grain: 'WeekActivity',
      filters: ['termId', 'courseId', 'traineeId', 'dateFrom', 'dateTo'],
      columns: [
        { key: 'traineeName', label: 'دانشجو' }, { key: 'weekNo', label: 'هفته' }, { key: 'submittedAt', label: 'زمان ثبت' },
        { key: 'fileName', label: 'فایل' }, { key: 'size', label: 'حجم/نوع' }, { key: 'course', label: 'درس' },
      ],
      roleLabels: { supervisor_professor: 'لیست فعالیت‌های بارگذاری شده توسط دانشجو' },
      rows: [
        { traineeName: 'امیرحسین کریمی', weekNo: '۴', submittedAt: '۱۴۰۵/۰۷/۱۲', fileName: 'گزارش_۴.pdf', size: '۱.۲MB / pdf', course: 'کارورزی ۲' },
      ] },

    { id: 'activity_delays', title: 'گزارش تاخیر ثبت فعالیت دانشجویان در بازه زمانی تعیین‌شده', category: 'C1_trainee', icon: 'fa-clock',
      summary: 'هفته‌های معوق یا تمدیدشده — استاد راهنما', comparable: true, grain: 'WeekActivity',
      filters: ['termId', 'weekStatus', 'dateFrom', 'dateTo', 'traineeId'],
      columns: [
        { key: 'traineeName', label: 'دانشجو' }, { key: 'weekNo', label: 'هفته' }, { key: 'status', label: 'وضعیت' },
        { key: 'submittedAt', label: 'زمان ارسال' }, { key: 'delayFlag', label: 'تأخیر' },
      ],
      roleLabels: { supervisor_professor: 'گزارش تاخیر ثبت فعالیت دانشجویان در بازه زمانی تعیین‌شده' },
      rows: [
        { traineeName: 'سارا محمدی', weekNo: '۳', status: 'معوق', submittedAt: '۱۴۰۵/۰۷/۱۸', delayFlag: 'overdue' },
      ] },

    { id: 'activity_feedbacks', title: 'گزارش بازخوردهای فعالیت‌های انجام‌شده', category: 'C2_grades', icon: 'fa-comments',
      summary: 'بازخورد معلم/مدیر/استاد روی هفته‌ها', comparable: true, grain: 'WeekActivity',
      filters: ['termId', 'feedbackRole', 'dateFrom', 'dateTo', 'traineeId'],
      columns: [
        { key: 'traineeName', label: 'کارورز' }, { key: 'weekNo', label: 'هفته' }, { key: 'role', label: 'نقش بازخورد' },
        { key: 'rating', label: 'امتیاز' }, { key: 'textSnippet', label: 'متن بازخورد' }, { key: 'at', label: 'زمان' },
      ],
      roleLabels: {
        student: 'لیست بازخوردهای استاد راهنما، مدیر و معلم راهنما',
        skill_learner: 'لیست بازخوردهای استاد راهنما، مدیر و معلم راهنما',
        mentor_teacher: 'گزارش بازخوردهای فعالیت‌های انجام‌شده',
        supervisor_professor: 'گزارش بازخوردهای فعالیت‌های انجام‌شده',
      },
      roleColumns: {
        student: ['weekNo', 'role', 'rating', 'textSnippet', 'at'],
        skill_learner: ['weekNo', 'role', 'rating', 'textSnippet', 'at'],
        mentor_teacher: ['traineeName', 'weekNo', 'role', 'rating', 'textSnippet', 'at'],
        supervisor_professor: ['traineeName', 'weekNo', 'role', 'rating', 'textSnippet', 'at'],
      },
      rows: [
        { traineeName: 'امیرحسین کریمی', weekNo: '۴', role: 'معلم راهنما', rating: '۴.۵', textSnippet: 'عملکرد خوب در کلاس', at: '۱۴۰۵/۰۷/۱۲' },
        { traineeName: 'امیرحسین کریمی', weekNo: '۴', role: 'مدیر', rating: '۵', textSnippet: 'حضور منظم', at: '۱۴۰۵/۰۷/۱۳' },
        { traineeName: 'امیرحسین کریمی', weekNo: '۴', role: 'استاد راهنما', rating: '۹۰', textSnippet: 'قابل قبول', at: '۱۴۰۵/۰۷/۱۴' },
      ] },

    { id: 'final_grades', title: 'لیست نمرات و ارزیابی‌ پایانی', category: 'C2_grades', icon: 'fa-award',
      summary: 'نمره نهایی دوره — استاد راهنما', comparable: true, grain: 'WeekActivity',
      filters: ['termId', 'courseId', 'minScore', 'maxScore', 'traineeId'],
      columns: [
        { key: 'traineeName', label: 'کارورز' }, { key: 'code', label: 'شناسه' }, { key: 'course', label: 'درس' },
        { key: 'mentorAvg', label: 'میانگین معلم راهنما' }, { key: 'principalAvg', label: 'میانگین مدیر' },
        { key: 'supervisorFinal', label: 'نمره استاد راهنما' }, { key: 'total20', label: 'از ۲۰' }, { key: 'outcome', label: 'نتیجه' },
      ],
      roleLabels: { supervisor_professor: 'لیست نمرات و ارزیابی‌ پایانی' },
      rows: [
        { traineeName: 'امیرحسین کریمی', code: '۴۰۱۲۳۴۵۶۷', course: 'کارورزی ۲', mentorAvg: '۴.۴', principalAvg: '۴.۸', supervisorFinal: '۹۰', total20: '۱۸.۵', outcome: 'قبول' },
        { traineeName: 'سارا محمدی', code: '۴۰۱۲۳۴۵۶۸', course: 'کارورزی ۲', mentorAvg: '۴.۰', principalAvg: '۴.۲', supervisorFinal: '۸۲', total20: '۱۶.۰', outcome: 'قبول' },
      ] },

    { id: 'grades_by_supervisor', title: 'لیست نمرات کارورزان به تفکیک استاد راهنما', category: 'C2_grades', icon: 'fa-list-ol',
      summary: 'نمرات کارورزان با تفکیک ابعاد سند مهر', comparable: true, grain: 'TraineeRoster',
      filters: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'schoolId', 'courseId', 'principalId', 'mentorId', 'supervisorId', 'minScore', 'maxScore'],
      columns: [
        { key: 'traineeName', label: 'کارورز' }, { key: 'code', label: 'شناسه' },
        { key: 'province', label: 'استان' }, { key: 'city', label: 'شهر' }, { key: 'district', label: 'منطقه' },
        { key: 'college', label: 'دانشکده' }, { key: 'school', label: 'مدرسه' }, { key: 'termTitle', label: 'دوره تحصیلی' },
        { key: 'principalName', label: 'مدیر مدرسه' }, { key: 'mentorName', label: 'معلم راهنما' }, { key: 'supervisorName', label: 'استاد راهنما' },
        { key: 'total20', label: 'نمره از ۲۰' }, { key: 'outcome', label: 'نتیجه' },
      ],
      roleLabels: {
        faculty_role: 'لیست نمرات کارورزان به تفکیک استاد راهنما',
        provincial_university: 'لیست نمرات کارورزان به تفکیک استاد راهنما',
        central_organization: 'لیست نمرات کارورزان به تفکیک استان، شهر، دانشکده، منطقه، مدرسه، دوره تخصیلی، مدیر مدرسه،  معلم راهنما و استاد راهنما',
        super_admin: 'لیست نمرات کارورزان به تفکیک استان، شهر، دانشکده، منطقه، مدرسه، دوره تخصیلی، مدیر مدرسه،  معلم راهنما و استاد راهنما',
        assistant_admin: 'لیست نمرات کارورزان به تفکیک استان، شهر، دانشکده، منطقه، مدرسه، دوره تخصیلی، مدیر مدرسه،  معلم راهنما و استاد راهنما',
      },
      roleColumns: {
        faculty_role: ['traineeName', 'code', 'supervisorName', 'total20', 'outcome'],
        provincial_university: ['traineeName', 'code', 'college', 'supervisorName', 'total20', 'outcome'],
        central_organization: ['traineeName', 'code', 'province', 'city', 'college', 'district', 'school', 'termTitle', 'principalName', 'mentorName', 'supervisorName', 'total20', 'outcome'],
        super_admin: ['traineeName', 'code', 'province', 'city', 'college', 'district', 'school', 'termTitle', 'principalName', 'mentorName', 'supervisorName', 'total20', 'outcome'],
        assistant_admin: ['traineeName', 'code', 'province', 'city', 'college', 'district', 'school', 'termTitle', 'principalName', 'mentorName', 'supervisorName', 'total20', 'outcome'],
      },
      rows: [
        { traineeName: 'امیرحسین کریمی', code: '۴۰۱۲۳۴۵۶۷', province: 'تهران', city: 'تهران', district: 'ناحیه ۱', college: 'باهنر', school: 'البرز', termTitle: 'نیم‌سال ۲', principalName: 'عباس پناهی', mentorName: 'مرتضی ملکی', supervisorName: 'دکتر کریمی', total20: '۱۸.۵', outcome: 'قبول' },
        { traineeName: 'سارا محمدی', code: '۴۰۱۲۳۴۵۶۸', province: 'تهران', city: 'تهران', district: 'ناحیه ۲', college: 'باهنر', school: 'فجر', termTitle: 'نیم‌سال ۲', principalName: 'حسن رضایی', mentorName: 'سارا اکبری', supervisorName: 'دکتر کریمی', total20: '۱۶.۰', outcome: 'قبول' },
      ] },

    { id: 'mentors_list', title: 'لیست معلمان راهنما', category: 'C3_staff_schools', icon: 'fa-chalkboard-user',
      summary: 'شناسنامه معلمان مطابق تفکیک نقش', comparable: true, grain: 'StaffOrg',
      filters: ['termId', 'provinceId', 'cityId', 'districtId', 'schoolId', 'collegeId', 'courseId', 'mentorId', 'traineeId'],
      columns: [
        { key: 'personName', label: 'معلم راهنما' }, { key: 'province', label: 'استان' }, { key: 'city', label: 'شهر' }, { key: 'district', label: 'منطقه' },
        { key: 'college', label: 'دانشکده' }, { key: 'school', label: 'مدرسه' }, { key: 'termTitle', label: 'دوره تحصیلی' },
        { key: 'traineeName', label: 'کارورز' }, { key: 'traineeCount', label: 'تعداد کارورز' },
      ],
      roleLabels: {
        supervisor_professor: 'لیست معلمان به تفکیک استان، شهر منطقه، مدرسه و کارورز',
        central_organization: 'لیست معلمان راهنما به  تفکیک استان،شهر، منطقه، دانشکده، مدرسه، دوره تحصیلی',
        super_admin: 'لیست معلمان راهنما به  تفکیک استان،شهر، منطقه، دانشکده، مدرسه، دوره تحصیلی',
        assistant_admin: 'لیست معلمان راهنما به  تفکیک استان،شهر، منطقه، دانشکده، مدرسه، دوره تحصیلی',
      },
      roleColumns: {
        supervisor_professor: ['personName', 'province', 'city', 'district', 'school', 'traineeName', 'traineeCount'],
        central_organization: ['personName', 'province', 'city', 'district', 'college', 'school', 'termTitle', 'traineeCount'],
        super_admin: ['personName', 'province', 'city', 'district', 'college', 'school', 'termTitle', 'traineeCount'],
        assistant_admin: ['personName', 'province', 'city', 'district', 'college', 'school', 'termTitle', 'traineeCount'],
      },
      rows: [
        { personName: 'مرتضی ملکی', province: 'تهران', city: 'تهران', district: 'ناحیه ۱', college: 'باهنر', school: 'البرز', termTitle: 'نیم‌سال ۲', traineeName: 'امیرحسین کریمی', traineeCount: '۶' },
        { personName: 'سارا اکبری', province: 'تهران', city: 'تهران', district: 'ناحیه ۲', college: 'باهنر', school: 'فجر', termTitle: 'نیم‌سال ۲', traineeName: 'سارا محمدی', traineeCount: '۴' },
      ] },

    { id: 'principals_list', title: 'لیست مدیران مدارس', category: 'C3_staff_schools', icon: 'fa-user-tie',
      summary: 'شناسنامه مدیران مطابق تفکیک نقش', comparable: true, grain: 'StaffOrg',
      filters: ['termId', 'provinceId', 'cityId', 'districtId', 'schoolId', 'collegeId', 'courseId', 'principalId', 'mentorId', 'traineeId'],
      columns: [
        { key: 'personName', label: 'مدیر مدرسه' }, { key: 'province', label: 'استان' }, { key: 'city', label: 'شهر' }, { key: 'district', label: 'منطقه' },
        { key: 'college', label: 'دانشکده' }, { key: 'school', label: 'مدرسه' }, { key: 'termTitle', label: 'دوره تحصیلی' },
        { key: 'mentorName', label: 'معلم راهنما' }, { key: 'traineeName', label: 'کارورز' }, { key: 'traineeCount', label: 'تعداد کارورز' },
      ],
      roleLabels: {
        supervisor_professor: 'لیست مدیران به تفکیک استان، شهر منطقه، مدرسه، کارورز و معلم راهنما',
        central_organization: 'لیست مدیران مدارس به  تفکیک استان،شهر، منطقه، دانشکده، مدرسه، دوره تحصیلی',
        super_admin: 'لیست مدیران مدارس به  تفکیک استان،شهر، منطقه، دانشکده، مدرسه، دوره تحصیلی',
        assistant_admin: 'لیست مدیران مدارس به  تفکیک استان،شهر، منطقه، دانشکده، مدرسه، دوره تحصیلی',
      },
      roleColumns: {
        supervisor_professor: ['personName', 'province', 'city', 'district', 'school', 'traineeName', 'mentorName'],
        central_organization: ['personName', 'province', 'city', 'district', 'college', 'school', 'termTitle', 'traineeCount'],
        super_admin: ['personName', 'province', 'city', 'district', 'college', 'school', 'termTitle', 'traineeCount'],
        assistant_admin: ['personName', 'province', 'city', 'district', 'college', 'school', 'termTitle', 'traineeCount'],
      },
      rows: [
        { personName: 'عباس پناهی', province: 'تهران', city: 'تهران', district: 'ناحیه ۱', college: 'باهنر', school: 'البرز', termTitle: 'نیم‌سال ۲', mentorName: 'مرتضی ملکی', traineeName: 'امیرحسین کریمی', traineeCount: '۱۲' },
      ] },

    { id: 'supervisors_directory', title: 'لیست استادان راهنما', category: 'C3_staff_schools', icon: 'fa-user-graduate',
      summary: 'دایرکتوری اساتید — سازمان مرکزی', comparable: true, grain: 'StaffOrg',
      filters: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'schoolId', 'courseId', 'supervisorId'],
      columns: [
        { key: 'personName', label: 'استاد راهنما' }, { key: 'province', label: 'استان' }, { key: 'city', label: 'شهر' }, { key: 'district', label: 'منطقه' },
        { key: 'college', label: 'دانشکده' }, { key: 'school', label: 'مدرسه' }, { key: 'termTitle', label: 'دوره تحصیلی' }, { key: 'traineeCount', label: 'کارورز' },
      ],
      roleLabels: {
        central_organization: 'لیست استادان راهنما به تفکیک استان،شهر، منطقه، دانشکده، مدرسه، دوره تحصیلی',
        super_admin: 'لیست استادان راهنما به تفکیک استان،شهر، منطقه، دانشکده، مدرسه، دوره تحصیلی',
        assistant_admin: 'لیست استادان راهنما به تفکیک استان،شهر، منطقه، دانشکده، مدرسه، دوره تحصیلی',
      },
      roleColumns: {
        central_organization: ['personName', 'province', 'city', 'district', 'college', 'school', 'termTitle', 'traineeCount'],
        super_admin: ['personName', 'province', 'city', 'district', 'college', 'school', 'termTitle', 'traineeCount'],
        assistant_admin: ['personName', 'province', 'city', 'district', 'college', 'school', 'termTitle', 'traineeCount'],
      },
      rows: [
        { personName: 'دکتر کریمی', province: 'تهران', city: 'تهران', district: 'ناحیه ۱', college: 'باهنر', school: 'البرز', termTitle: 'نیم‌سال ۲', traineeCount: '۲۴' },
      ] },

    { id: 'active_schools_list', title: 'لیست مدارس فعال', category: 'C3_staff_schools', icon: 'fa-school',
      summary: 'مدارس همکار با دوره، جنسیت، روز و ظرفیت', comparable: true, grain: 'StaffOrg',
      filters: ['termId', 'courseId', 'provinceId', 'cityId', 'districtId', 'gender', 'weekday', 'minTrainees', 'mentorId'],
      columns: [
        { key: 'school', label: 'مدرسه' }, { key: 'city', label: 'شهر' }, { key: 'district', label: 'منطقه' },
        { key: 'courseTitle', label: 'دوره' }, { key: 'gender', label: 'جنسیت' }, { key: 'selectedDays', label: 'روز کارورزی' },
        { key: 'mentorName', label: 'معلم راهنما' }, { key: 'mentorCount', label: 'تعداد معلم' }, { key: 'traineeCount', label: 'تعداد کارورز' },
      ],
      roleLabels: {
        regional_edu_admin: 'لیست مدارس فعال به تفکیک دوره، جنسیت، روز کارورزی، معلم راهنما و تعداد کارورزان',
        edu_general_admin: 'لیست مدارس فعال به تفکیک شهر/منطقه، مدرسه، دوره، جنسیت، روز کارورزی، معلم راهنما و تعداد کارورزان',
      },
      roleColumns: {
        regional_edu_admin: ['school', 'courseTitle', 'gender', 'selectedDays', 'mentorName', 'traineeCount'],
        edu_general_admin: ['city', 'district', 'school', 'courseTitle', 'gender', 'selectedDays', 'mentorName', 'traineeCount'],
      },
      rows: [
        { school: 'البرز', city: 'تهران', district: 'ناحیه ۱', courseTitle: 'کارورزی ۲', gender: 'پسرانه', selectedDays: 'شنبه', mentorName: 'مرتضی ملکی', mentorCount: '۲', traineeCount: '۱۲' },
        { school: 'فجر', city: 'تهران', district: 'ناحیه ۲', courseTitle: 'کارورزی ۲', gender: 'دخترانه', selectedDays: 'یکشنبه', mentorName: 'سارا اکبری', mentorCount: '۱', traineeCount: '۸' },
      ] },

    { id: 'schools_directory', title: 'لیست مدارس', category: 'C3_staff_schools', icon: 'fa-building',
      summary: 'دایرکتوری مرکزی مدارس', comparable: true, grain: 'StaffOrg',
      filters: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'courseId'],
      columns: [
        { key: 'school', label: 'مدرسه' }, { key: 'province', label: 'استان' }, { key: 'city', label: 'شهر' }, { key: 'district', label: 'منطقه' },
        { key: 'college', label: 'دانشکده' }, { key: 'termTitle', label: 'دوره تحصیلی' }, { key: 'traineeCount', label: 'کارورز' },
      ],
      roleLabels: {
        central_organization: 'لیست مدارس به  تفکیک استان،شهر، منطقه، دانشکده، مدرسه، دوره تحصیلی',
        super_admin: 'لیست مدارس به  تفکیک استان،شهر، منطقه، دانشکده، مدرسه، دوره تحصیلی',
        assistant_admin: 'لیست مدارس به  تفکیک استان،شهر، منطقه، دانشکده، مدرسه، دوره تحصیلی',
      },
      roleColumns: {
        central_organization: ['province', 'city', 'district', 'college', 'school', 'termTitle', 'traineeCount'],
        super_admin: ['province', 'city', 'district', 'college', 'school', 'termTitle', 'traineeCount'],
        assistant_admin: ['province', 'city', 'district', 'college', 'school', 'termTitle', 'traineeCount'],
      },
      rows: [
        { school: 'البرز', province: 'تهران', city: 'تهران', district: 'ناحیه ۱', college: 'باهنر', termTitle: 'نیم‌سال ۲', traineeCount: '۱۲' },
      ] },

    { id: 'districts_active_list', title: 'لیست شهرها یا مناطق فعال', category: 'C3_staff_schools', icon: 'fa-map',
      summary: 'اداره کل — تعداد مدرسه/معلم/کارورز', comparable: true, grain: 'AggregatePerf',
      filters: ['termId', 'provinceId', 'cityId', 'districtId'],
      columns: [
        { key: 'place', label: 'شهر/منطقه' }, { key: 'schoolsCount', label: 'تعداد مدرسه' },
        { key: 'mentorsCount', label: 'تعداد معلم راهنما' }, { key: 'traineesCount', label: 'تعداد کارورز' },
      ],
      roleLabels: {
        edu_general_admin: 'لیست شهرها یا مناطق فعال به تفکیک تعداد مدرسه، معلم راهنما و کارورز',
      },
      rows: [
        { place: 'ناحیه ۱ تهران', schoolsCount: '۱۴', mentorsCount: '۲۲', traineesCount: '۸۶' },
        { place: 'ناحیه ۲ تهران', schoolsCount: '۱۱', mentorsCount: '۱۸', traineesCount: '۶۴' },
      ] },

    { id: 'mentor_feedback_performance', title: 'گزارش عملکرد معلمان راهنما بر مبنای بازخورد فعالیت‌های انجام‌شده', category: 'C3_staff_schools', icon: 'fa-chart-line',
      summary: 'نرخ و کیفیت بازخورد معلمان', comparable: true, grain: 'AggregatePerf',
      filters: ['termId', 'schoolId', 'mentorId', 'collegeId'],
      columns: [
        { key: 'entityName', label: 'معلم راهنما' }, { key: 'scope', label: 'مدرسه' },
        { key: 'responseRate', label: 'نرخ پاسخ' }, { key: 'avgRating', label: 'میانگین بازخورد' }, { key: 'feedbackCount', label: 'حجم بازخورد' },
      ],
      roleLabels: {
        school_principal: 'گزارش عملکرد معلمان راهنما بر مبنای  بازخورد فعالیت‌های انجام‌شده',
        faculty_role: 'گزارش عملکرد معلمان راهنما بر مبنای  بازخورد فعالیت‌های انجام‌شده',
      },
      rows: [
        { entityName: 'مرتضی ملکی', scope: 'البرز', responseRate: '۹۲٪', avgRating: '۴.۴', feedbackCount: '۴۸' },
      ] },

    { id: 'principal_feedback_performance', title: 'گزارش عملکرد مدیران مدارس بر مبنای بازخورد فعالیت‌های انجام‌شده', category: 'C3_staff_schools', icon: 'fa-chart-column',
      summary: 'عملکرد بازخوردی مدیران', comparable: true, grain: 'AggregatePerf',
      filters: ['termId', 'collegeId', 'principalId', 'districtId'],
      columns: [
        { key: 'entityName', label: 'مدیر مدرسه' }, { key: 'scope', label: 'مدرسه / منطقه' },
        { key: 'responseRate', label: 'نرخ پاسخ' }, { key: 'avgRating', label: 'میانگین بازخورد' },
      ],
      roleLabels: {
        faculty_role: 'گزارش عملکرد مدیران مدارس بر مبنای  بازخورد فعالیت‌های انجام‌شده',
      },
      rows: [
        { entityName: 'عباس پناهی', scope: 'البرز', responseRate: '۸۸٪', avgRating: '۴.۶' },
      ] },

    { id: 'supervisor_feedback_performance', title: 'گزارش عملکرد استادان راهنما بر مبنای بازخورد فعالیت‌های انجام‌شده', category: 'C3_staff_schools', icon: 'fa-user-graduate',
      summary: 'عملکرد بازخوردی اساتید', comparable: true, grain: 'AggregatePerf',
      filters: ['termId', 'collegeId', 'supervisorId'],
      columns: [
        { key: 'entityName', label: 'استاد راهنما' }, { key: 'responseRate', label: 'نرخ اقدام' }, { key: 'avgRating', label: 'میانگین نمره' },
      ],
      roleLabels: {
        faculty_role: 'گزارش عملکرد استادان راهنما بر مبنای  بازخورد فعالیت‌های انجام‌شده',
      },
      rows: [
        { entityName: 'دکتر کریمی', responseRate: '۹۵٪', avgRating: '۱۷.۲' },
      ] },

    { id: 'staff_feedback_performance', title: 'گزارش عملکرد مدیر و معلمان راهنما بر مبنای بازخورد فعالیت‌های انجام‌شده', category: 'C3_staff_schools', icon: 'fa-people-group',
      summary: 'ترکیب کادر برای منطقه/اداره‌کل', comparable: true, grain: 'AggregatePerf',
      filters: ['termId', 'provinceId', 'districtId', 'cityId', 'schoolId'],
      columns: [
        { key: 'entityName', label: 'نفر' }, { key: 'role', label: 'نقش' }, { key: 'scope', label: 'منطقه / مدرسه' },
        { key: 'responseRate', label: 'نرخ پاسخ' }, { key: 'avgRating', label: 'میانگین' },
      ],
      roleLabels: {
        regional_edu_admin: 'گزارش عملکرد مدیر و معلمان راهنما بر مبنای  بازخورد فعالیت‌های انجام‌شده',
        edu_general_admin: 'گزارش عملکرد مدیر و معلمان راهنما بر مبنای  بازخورد فعالیت‌های انجام‌شده به تفکیک مناطق',
      },
      roleColumns: {
        regional_edu_admin: ['entityName', 'role', 'scope', 'responseRate', 'avgRating'],
        edu_general_admin: ['entityName', 'role', 'scope', 'responseRate', 'avgRating'],
      },
      rows: [
        { entityName: 'مرتضی ملکی', role: 'معلم راهنما', scope: 'ناحیه ۱', responseRate: '۹۲٪', avgRating: '۴.۴' },
        { entityName: 'عباس پناهی', role: 'مدیر', scope: 'ناحیه ۱', responseRate: '۸۸٪', avgRating: '۴.۶' },
      ] },

    { id: 'college_feedback_performance', title: 'گزارش عملکرد دانشکده بر مبنای بازخورد استادان راهنما به فعالیت‌های انجام‌شده', category: 'C3_staff_schools', icon: 'fa-building-columns',
      summary: 'تجمیع پردیس — دانشگاه استانی', comparable: true, grain: 'AggregatePerf',
      filters: ['termId', 'collegeId'],
      columns: [
        { key: 'entityName', label: 'دانشکده' }, { key: 'traineesCovered', label: 'تعداد استاد' },
        { key: 'responseRate', label: 'نرخ اقدام' }, { key: 'avgRating', label: 'میانگین' },
      ],
      roleLabels: {
        provincial_university: 'گزارش عملکرد دانشکده بر مبنای بازخورد استادان راهنما به فعالیت‌های انجام‌شده',
      },
      rows: [
        { entityName: 'باهنر', traineesCovered: '۱۲', responseRate: '۹۱٪', avgRating: '۱۷.۰' },
      ] },

    { id: 'supervisor_school_visits', title: 'لیست تعداد جلسات حضور استاد راهنما در مدارس', category: 'C3_staff_schools', icon: 'fa-person-walking',
      summary: 'شمارش بازدید استاد از مدارس', comparable: true, grain: 'WeekActivity',
      filters: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'supervisorId', 'schoolId'],
      columns: [
        { key: 'supervisorName', label: 'استاد راهنما' }, { key: 'province', label: 'استان' }, { key: 'city', label: 'شهر' },
        { key: 'district', label: 'منطقه' }, { key: 'college', label: 'دانشکده' }, { key: 'school', label: 'مدرسه' },
        { key: 'visitDaysCount', label: 'تعداد جلسات' },
      ],
      roleLabels: {
        faculty_role: 'لیست تعداد جلسات حضور استاد راهنما در مدارس',
        provincial_university: 'لیست تعداد جلسات حضور استاد راهنما در مدارس به تفکیک دانشکده',
        central_organization: 'لیست تعداد جلسات حضور استاد راهنما در مدارس به تفکیک استان،شهر، منطقه، دانشکده',
        super_admin: 'لیست تعداد جلسات حضور استاد راهنما در مدارس به تفکیک استان،شهر، منطقه، دانشکده',
        assistant_admin: 'لیست تعداد جلسات حضور استاد راهنما در مدارس به تفکیک استان،شهر، منطقه، دانشکده',
      },
      roleColumns: {
        faculty_role: ['supervisorName', 'school', 'visitDaysCount'],
        provincial_university: ['supervisorName', 'college', 'school', 'visitDaysCount'],
        central_organization: ['supervisorName', 'province', 'city', 'district', 'college', 'school', 'visitDaysCount'],
        super_admin: ['supervisorName', 'province', 'city', 'district', 'college', 'school', 'visitDaysCount'],
        assistant_admin: ['supervisorName', 'province', 'city', 'district', 'college', 'school', 'visitDaysCount'],
      },
      rows: [
        { supervisorName: 'دکتر کریمی', province: 'تهران', city: 'تهران', district: 'ناحیه ۱', college: 'باهنر', school: 'البرز', visitDaysCount: '۵' },
      ] },

    { id: 'province_college_supervisor_perf', title: 'گزارش عملکرد استان، دانشکده بر مبنای بازخورد استادان راهنما به فعالیت‌های انجام‌شده', category: 'C3_staff_schools', icon: 'fa-map-location',
      summary: 'کلان مرکزی', comparable: true, grain: 'AggregatePerf',
      filters: ['termId', 'provinceId', 'collegeId'],
      columns: [
        { key: 'entityName', label: 'استان' }, { key: 'scope', label: 'دانشکده' },
        { key: 'responseRate', label: 'نرخ اقدام' }, { key: 'avgRating', label: 'میانگین' },
      ],
      roleLabels: {
        central_organization: 'گزارش عملکرد استان، دانشکده بر مبنای بازخورد استادان راهنما به فعالیت‌های انجام‌شده',
      },
      rows: [
        { entityName: 'تهران', scope: 'باهنر', responseRate: '۹۱٪', avgRating: '۱۷.۰' },
      ] },

    { id: 'province_college_mentor_perf', title: 'گزارش عملکرد استان، دانشکده بر مبنای بازخورد معلمان راهنما به فعالیت‌های انجام‌شده', category: 'C3_staff_schools', icon: 'fa-map-pin',
      summary: 'کلان مرکزی', comparable: true, grain: 'AggregatePerf',
      filters: ['termId', 'provinceId', 'collegeId'],
      columns: [
        { key: 'entityName', label: 'استان' }, { key: 'scope', label: 'دانشکده' },
        { key: 'responseRate', label: 'نرخ پاسخ' }, { key: 'avgRating', label: 'میانگین' },
      ],
      roleLabels: {
        central_organization: 'گزارش عملکرد استان، دانشکده بر مبنای بازخورد معلمان راهنما به فعالیت‌های انجام‌شده',
      },
      rows: [
        { entityName: 'تهران', scope: 'باهنر', responseRate: '۸۹٪', avgRating: '۴.۳' },
      ] },

    { id: 'province_college_principal_perf', title: 'گزارش عملکرد استان، دانشکده بر مبنای بازخورد مدیران مدارس به فعالیت‌های انجام‌شده', category: 'C3_staff_schools', icon: 'fa-map',
      summary: 'کلان مرکزی', comparable: true, grain: 'AggregatePerf',
      filters: ['termId', 'provinceId', 'collegeId'],
      columns: [
        { key: 'entityName', label: 'استان' }, { key: 'scope', label: 'دانشکده' },
        { key: 'responseRate', label: 'نرخ پاسخ' }, { key: 'avgRating', label: 'میانگین' },
      ],
      roleLabels: {
        central_organization: 'گزارش عملکرد استان، دانشکده بر مبنای بازخورد مدیران مدارس به فعالیت‌های انجام‌شده',
      },
      rows: [
        { entityName: 'تهران', scope: 'باهنر', responseRate: '۸۶٪', avgRating: '۴.۵' },
      ] },

    { id: 'capacity_distribution', title: 'توزیع ظرفیت', category: 'C4_governance', icon: 'fa-chart-pie',
      summary: 'افزونه — خارج از سند مهر', comparable: true, grain: 'Capacity',
      filters: ['termId', 'provinceId', 'collegeId'],
      columns: [
        { key: 'target', label: 'مبنا' }, { key: 'total', label: 'کل' }, { key: 'confirmed', label: 'تأیید' }, { key: 'remain', label: 'باقی' },
      ],
      rows: [
        { target: 'مدرسه', total: '۱۲۰', confirmed: '۸۶', remain: '۳۴' },
      ] },
    { id: 'institutions_list', title: 'ساختار دانشگاه‌ها و پردیس‌ها', category: 'C4_governance', icon: 'fa-university',
      summary: 'افزونه', comparable: false, grain: 'StaffOrg',
      filters: ['provinceId', 'collegeId'],
      columns: [
        { key: 'college', label: 'پردیس' }, { key: 'province', label: 'استان' }, { key: 'city', label: 'شهر' },
      ],
      rows: [
        { college: 'باهنر', province: 'تهران', city: 'تهران' },
      ] },
    { id: 'activity_logs', title: 'حسابرس و لاگ سیستمی', category: 'C4_governance', icon: 'fa-clock-rotate-left',
      summary: 'افزونه — دامنه audit هنوز نیست', comparable: false, grain: 'Audit',
      filters: ['dateFrom', 'dateTo'],
      columns: [
        { key: 'at', label: 'زمان' }, { key: 'actor', label: 'کاربر' }, { key: 'action', label: 'عملیات' }, { key: 'meta', label: 'جزئیات' },
      ],
      rows: [
        { at: '۱۴۰۵/۰۷/۲۰ ۱۲:۰۴', actor: 'ادمین', action: 'تغییر دسترسی', meta: 'نقش استاد' },
      ] },
  ];

  /** ترتیب دقیق گزارش‌های استاندارد سند نهم مهر — برای هر نقش */
  const wordDefaults = {
    student: ['trainee_transcript', 'attendance_days', 'activity_feedbacks'],
    skill_learner: ['trainee_transcript', 'attendance_days', 'activity_feedbacks'],
    mentor_teacher: ['trainee_list', 'activity_feedbacks'],
    supervisor_professor: [
      'final_grades', 'activity_feedbacks', 'student_uploads', 'activity_delays', 'trainee_transcript',
      'trainee_list', 'attendance_days', 'mentors_list', 'principals_list',
    ],
    school_principal: ['trainee_list', 'mentor_feedback_performance', 'attendance_days'],
    regional_edu_admin: ['active_schools_list', 'trainee_list', 'staff_feedback_performance'],
    edu_general_admin: ['districts_active_list', 'active_schools_list', 'trainee_list', 'staff_feedback_performance'],
    faculty_role: [
      'trainee_list', 'supervisor_feedback_performance', 'mentor_feedback_performance', 'principal_feedback_performance',
      'grades_by_supervisor', 'attendance_days', 'supervisor_school_visits',
    ],
    provincial_university: [
      'trainee_list', 'college_feedback_performance', 'grades_by_supervisor', 'supervisor_school_visits', 'attendance_days',
    ],
    central_organization: [
      'trainee_list', 'supervisors_directory', 'mentors_list', 'principals_list', 'schools_directory',
      'supervisor_school_visits', 'attendance_days',
      'province_college_supervisor_perf', 'province_college_mentor_perf', 'province_college_principal_perf',
      'grades_by_supervisor',
    ],
    /* مدیر ارشد و دستیار: همهٔ گزارش‌های سند + افزونه‌های حاکمیت */
    assistant_admin: [],
    super_admin: [],
  };
  // اتحاد مرتب همهٔ گزارش‌های سند (بدون تکرار) سپس C4
  (() => {
    const seen = new Set();
    const ordered = [];
    [
      'student', 'mentor_teacher', 'supervisor_professor', 'school_principal', 'regional_edu_admin',
      'edu_general_admin', 'faculty_role', 'provincial_university', 'central_organization',
    ].forEach((role) => {
      (wordDefaults[role] || []).forEach((id) => {
        if (!seen.has(id)) { seen.add(id); ordered.push(id); }
      });
    });
    catalog.filter((r) => r.category === 'C4_governance').forEach((r) => {
      if (!seen.has(r.id)) { seen.add(r.id); ordered.push(r.id); }
    });
    wordDefaults.assistant_admin = ordered.slice();
    wordDefaults.super_admin = ordered.slice();
  })();

  const mockUsers = [
    { id: '#S1', name: 'امیرحسین کریمی', role: 'student', roleLabel: 'دانشجو / کارورز', icon: 'fa-graduation-cap', desc: 'کارنامه، حضور، بازخوردهای خودش' },
    { id: '#T1', name: 'رضا احمدی', role: 'skill_learner', roleLabel: 'مهارت‌آموز', icon: 'fa-screwdriver-wrench', desc: 'نمای کارورز مهارتی' },
    { id: '#M1', name: 'مرتضی ملکی', role: 'mentor_teacher', roleLabel: 'معلم راهنما', icon: 'fa-chalkboard-user', desc: 'لیست کارورزان تحت راهنمایی' },
    { id: '#P1', name: 'دکتر علیرضا کریمی', role: 'supervisor_professor', roleLabel: 'استاد راهنما', icon: 'fa-user-tie', desc: 'نمرات، بازخورد، آپلود، تأخیر' },
    { id: '#PR1', name: 'عباس پناهی', role: 'school_principal', roleLabel: 'مدیر مدرسه', icon: 'fa-school', desc: 'کارورزان مدرسه و عملکرد معلمان' },
    { id: '#RE1', name: 'مهندس اکبری', role: 'regional_edu_admin', roleLabel: 'مدیر منطقه', icon: 'fa-map-location-dot', desc: 'مدارس فعال و کادر منطقه' },
    { id: '#EG1', name: 'مهندس نادری', role: 'edu_general_admin', roleLabel: 'اداره کل', icon: 'fa-building', desc: 'مناطق فعال و مدارس شهرها' },
    { id: '#F1', name: 'دکتر رضازاده', role: 'faculty_role', roleLabel: 'رئیس دانشکده', icon: 'fa-school-flag', desc: 'عملکرد کادر و نمرات اساتید' },
    { id: '#PU1', name: 'دکتر علوی', role: 'provincial_university', roleLabel: 'دانشگاه استانی', icon: 'fa-university', desc: 'عملکرد دانشکده‌ها' },
    { id: '#CO1', name: 'مهندس حسینی', role: 'central_organization', roleLabel: 'سازمان مرکزی', icon: 'fa-building-columns', desc: 'نظارت کلان + RBAC' },
    { id: '#AA1', name: 'مهندس رضایی', role: 'assistant_admin', roleLabel: 'دستیار مدیر', icon: 'fa-user-gear', desc: 'پشتیبانی و RBAC' },
    { id: '#A1', name: 'ادمین سیستم', role: 'super_admin', roleLabel: 'مدیر ارشد', icon: 'fa-user-shield', desc: 'دسترسی کامل + RBAC' },
  ];

  /** سقف فیلتر مجاز هر نقش (scope نقش در بک‌اند؛ UI فقط زیرمجموعه را نشان می‌دهد). */
  const ALL_FILTER_KEYS = Object.keys(F);
  const roleFilterAllow = {
    student: ['termId', 'dateFrom', 'dateTo'],
    skill_learner: ['termId', 'dateFrom', 'dateTo'],
    mentor_teacher: ['termId', 'audience', 'courseId', 'traineeId', 'weekday', 'majorId', 'dateFrom', 'dateTo', 'feedbackRole', 'weekStatus'],
    school_principal: ['termId', 'audience', 'courseId', 'traineeId', 'collegeId', 'majorId', 'supervisorId', 'mentorId', 'weekday', 'dateFrom', 'dateTo'],
    supervisor_professor: [
      'termId', 'audience', 'courseId', 'provinceId', 'cityId', 'districtId', 'schoolId', 'collegeId',
      'traineeId', 'mentorId', 'principalId', 'weekday', 'dateFrom', 'dateTo', 'minScore', 'maxScore', 'weekStatus', 'feedbackRole',
    ],
    regional_edu_admin: [
      'termId', 'audience', 'courseId', 'cityId', 'districtId', 'schoolId', 'gender', 'weekday',
      'minTrainees', 'mentorId', 'principalId', 'supervisorId', 'traineeId', 'dateFrom', 'dateTo',
    ],
    edu_general_admin: [
      'termId', 'audience', 'courseId', 'provinceId', 'cityId', 'districtId', 'schoolId', 'gender',
      'weekday', 'minTrainees', 'mentorId', 'dateFrom', 'dateTo',
    ],
    faculty_role: [
      'termId', 'audience', 'courseId', 'provinceId', 'cityId', 'districtId', 'schoolId', 'collegeId',
      'supervisorId', 'mentorId', 'principalId', 'traineeId', 'dateFrom', 'dateTo', 'minScore', 'maxScore', 'weekday',
    ],
    provincial_university: [
      'termId', 'audience', 'courseId', 'cityId', 'districtId', 'schoolId', 'collegeId',
      'supervisorId', 'mentorId', 'principalId', 'traineeId', 'dateFrom', 'dateTo', 'minScore', 'maxScore',
    ],
    central_organization: ALL_FILTER_KEYS,
    assistant_admin: ALL_FILTER_KEYS,
    super_admin: ALL_FILTER_KEYS,
  };

  /**
   * شخصی‌سازی نقش×گزارش — اگر تعریف شده باشد، جایگزین تقاطع عمومی می‌شود.
   * فیلترهایی که با scope نقش ثابت‌اند (مدرسهٔ مدیر، خود کارورز، …) اینجا حذف شده‌اند.
   */
  const reportRoleFilters = {
    /* انطباق ۱۰۰٪ با ابعاد «تفکیک» سند نهم مهر — فیلترهای خارج از scope نقش حذف شده‌اند */
    trainee_transcript: {
      student: ['termId'],
      skill_learner: ['termId'],
      supervisor_professor: ['termId', 'traineeId'],
      super_admin: ['termId', 'traineeId'],
      assistant_admin: ['termId', 'traineeId'],
    },
    trainee_list: {
      mentor_teacher: ['termId', 'audience', 'courseId', 'weekday', 'majorId'],
      school_principal: ['termId', 'audience', 'courseId', 'collegeId', 'majorId', 'supervisorId', 'mentorId', 'weekday'],
      supervisor_professor: ['termId', 'audience', 'courseId', 'provinceId', 'cityId', 'districtId', 'schoolId', 'mentorId'],
      regional_edu_admin: ['termId', 'audience', 'courseId', 'cityId', 'districtId', 'schoolId', 'collegeId', 'majorId', 'supervisorId', 'mentorId', 'weekday'],
      edu_general_admin: ['termId', 'audience', 'courseId', 'cityId', 'districtId', 'schoolId', 'principalId', 'mentorId'],
      faculty_role: ['termId', 'audience', 'courseId', 'provinceId', 'cityId', 'districtId', 'schoolId', 'supervisorId', 'principalId', 'mentorId'],
      provincial_university: ['termId', 'audience', 'courseId', 'cityId', 'districtId', 'schoolId', 'collegeId', 'supervisorId', 'principalId', 'mentorId'],
      central_organization: ['termId', 'audience', 'courseId', 'provinceId', 'cityId', 'districtId', 'schoolId', 'collegeId', 'supervisorId', 'principalId', 'mentorId'],
      super_admin: ['termId', 'audience', 'courseId', 'provinceId', 'cityId', 'districtId', 'schoolId', 'collegeId', 'majorId', 'supervisorId', 'principalId', 'mentorId', 'weekday'],
      assistant_admin: ['termId', 'audience', 'courseId', 'provinceId', 'cityId', 'districtId', 'schoolId', 'collegeId', 'majorId', 'supervisorId', 'principalId', 'mentorId', 'weekday'],
    },
    attendance_days: {
      student: ['termId', 'dateFrom', 'dateTo'],
      skill_learner: ['termId', 'dateFrom', 'dateTo'],
      school_principal: ['termId', 'traineeId', 'dateFrom', 'dateTo'],
      supervisor_professor: ['termId', 'schoolId', 'traineeId', 'dateFrom', 'dateTo'],
      faculty_role: ['termId', 'schoolId', 'traineeId', 'dateFrom', 'dateTo'],
      provincial_university: ['termId', 'collegeId', 'schoolId', 'traineeId', 'dateFrom', 'dateTo'],
      central_organization: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'schoolId', 'traineeId', 'dateFrom', 'dateTo'],
      super_admin: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'schoolId', 'traineeId', 'dateFrom', 'dateTo'],
      assistant_admin: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'schoolId', 'traineeId', 'dateFrom', 'dateTo'],
    },
    student_uploads: {
      supervisor_professor: ['termId', 'courseId', 'traineeId', 'dateFrom', 'dateTo'],
      super_admin: ['termId', 'courseId', 'traineeId', 'dateFrom', 'dateTo'],
      assistant_admin: ['termId', 'courseId', 'traineeId', 'dateFrom', 'dateTo'],
    },
    activity_delays: {
      supervisor_professor: ['termId', 'weekStatus', 'traineeId', 'dateFrom', 'dateTo'],
      super_admin: ['termId', 'weekStatus', 'traineeId', 'dateFrom', 'dateTo'],
      assistant_admin: ['termId', 'weekStatus', 'traineeId', 'dateFrom', 'dateTo'],
    },
    activity_feedbacks: {
      student: ['termId', 'dateFrom', 'dateTo'],
      skill_learner: ['termId', 'dateFrom', 'dateTo'],
      mentor_teacher: ['termId', 'traineeId', 'dateFrom', 'dateTo'],
      supervisor_professor: ['termId', 'feedbackRole', 'traineeId', 'dateFrom', 'dateTo'],
      super_admin: ['termId', 'feedbackRole', 'traineeId', 'dateFrom', 'dateTo'],
      assistant_admin: ['termId', 'feedbackRole', 'traineeId', 'dateFrom', 'dateTo'],
    },
    final_grades: {
      supervisor_professor: ['termId', 'courseId', 'minScore', 'maxScore', 'traineeId'],
      super_admin: ['termId', 'courseId', 'minScore', 'maxScore', 'traineeId'],
      assistant_admin: ['termId', 'courseId', 'minScore', 'maxScore', 'traineeId'],
    },
    grades_by_supervisor: {
      faculty_role: ['termId', 'supervisorId', 'minScore', 'maxScore'],
      provincial_university: ['termId', 'collegeId', 'supervisorId', 'minScore', 'maxScore'],
      central_organization: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'schoolId', 'courseId', 'principalId', 'mentorId', 'supervisorId', 'minScore', 'maxScore'],
      super_admin: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'schoolId', 'courseId', 'principalId', 'mentorId', 'supervisorId', 'minScore', 'maxScore'],
      assistant_admin: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'schoolId', 'courseId', 'principalId', 'mentorId', 'supervisorId', 'minScore', 'maxScore'],
    },
    mentors_list: {
      supervisor_professor: ['termId', 'provinceId', 'cityId', 'districtId', 'schoolId', 'mentorId', 'traineeId'],
      central_organization: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'schoolId', 'courseId', 'mentorId'],
      super_admin: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'schoolId', 'courseId', 'mentorId'],
      assistant_admin: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'schoolId', 'courseId', 'mentorId'],
    },
    principals_list: {
      supervisor_professor: ['termId', 'provinceId', 'cityId', 'districtId', 'schoolId', 'principalId', 'mentorId', 'traineeId'],
      central_organization: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'schoolId', 'courseId', 'principalId'],
      super_admin: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'schoolId', 'courseId', 'principalId'],
      assistant_admin: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'schoolId', 'courseId', 'principalId'],
    },
    supervisors_directory: {
      central_organization: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'schoolId', 'courseId', 'supervisorId'],
      super_admin: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'schoolId', 'courseId', 'supervisorId'],
      assistant_admin: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'schoolId', 'courseId', 'supervisorId'],
    },
    active_schools_list: {
      regional_edu_admin: ['termId', 'courseId', 'gender', 'weekday', 'mentorId', 'minTrainees'],
      edu_general_admin: ['termId', 'courseId', 'cityId', 'districtId', 'gender', 'weekday', 'mentorId', 'minTrainees'],
      super_admin: ['termId', 'courseId', 'provinceId', 'cityId', 'districtId', 'gender', 'weekday', 'mentorId', 'minTrainees'],
      assistant_admin: ['termId', 'courseId', 'provinceId', 'cityId', 'districtId', 'gender', 'weekday', 'mentorId', 'minTrainees'],
    },
    schools_directory: {
      central_organization: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'courseId'],
      super_admin: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'courseId'],
      assistant_admin: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'courseId'],
    },
    districts_active_list: {
      edu_general_admin: ['termId', 'cityId', 'districtId'],
      super_admin: ['termId', 'provinceId', 'cityId', 'districtId'],
      assistant_admin: ['termId', 'provinceId', 'cityId', 'districtId'],
    },
    mentor_feedback_performance: {
      school_principal: ['termId', 'mentorId'],
      faculty_role: ['termId', 'schoolId', 'mentorId'],
      super_admin: ['termId', 'schoolId', 'mentorId', 'collegeId'],
      assistant_admin: ['termId', 'schoolId', 'mentorId', 'collegeId'],
    },
    principal_feedback_performance: {
      faculty_role: ['termId', 'principalId', 'districtId'],
      super_admin: ['termId', 'principalId', 'districtId', 'collegeId'],
      assistant_admin: ['termId', 'principalId', 'districtId', 'collegeId'],
    },
    supervisor_feedback_performance: {
      faculty_role: ['termId', 'supervisorId'],
      super_admin: ['termId', 'supervisorId', 'collegeId'],
      assistant_admin: ['termId', 'supervisorId', 'collegeId'],
    },
    staff_feedback_performance: {
      regional_edu_admin: ['termId', 'districtId', 'cityId', 'schoolId'],
      edu_general_admin: ['termId', 'districtId', 'cityId', 'schoolId'],
      super_admin: ['termId', 'provinceId', 'districtId', 'cityId', 'schoolId'],
      assistant_admin: ['termId', 'provinceId', 'districtId', 'cityId', 'schoolId'],
    },
    college_feedback_performance: {
      provincial_university: ['termId', 'collegeId'],
      super_admin: ['termId', 'collegeId'],
      assistant_admin: ['termId', 'collegeId'],
    },
    supervisor_school_visits: {
      faculty_role: ['termId', 'supervisorId', 'schoolId'],
      provincial_university: ['termId', 'collegeId', 'supervisorId', 'schoolId'],
      central_organization: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'supervisorId', 'schoolId'],
      super_admin: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'supervisorId', 'schoolId'],
      assistant_admin: ['termId', 'provinceId', 'cityId', 'districtId', 'collegeId', 'supervisorId', 'schoolId'],
    },
    province_college_supervisor_perf: {
      central_organization: ['termId', 'provinceId', 'collegeId'],
      super_admin: ['termId', 'provinceId', 'collegeId'],
      assistant_admin: ['termId', 'provinceId', 'collegeId'],
    },
    province_college_mentor_perf: {
      central_organization: ['termId', 'provinceId', 'collegeId'],
      super_admin: ['termId', 'provinceId', 'collegeId'],
      assistant_admin: ['termId', 'provinceId', 'collegeId'],
    },
    province_college_principal_perf: {
      central_organization: ['termId', 'provinceId', 'collegeId'],
      super_admin: ['termId', 'provinceId', 'collegeId'],
      assistant_admin: ['termId', 'provinceId', 'collegeId'],
    },
    capacity_distribution: {
      central_organization: ['termId', 'provinceId', 'collegeId'],
      super_admin: ['termId', 'provinceId', 'collegeId'],
      assistant_admin: ['termId', 'provinceId', 'collegeId'],
    },
    institutions_list: {
      super_admin: ['provinceId', 'collegeId'],
      assistant_admin: ['provinceId', 'collegeId'],
    },
    activity_logs: {
      super_admin: ['dateFrom', 'dateTo'],
      assistant_admin: ['dateFrom', 'dateTo'],
    },
  };

  const roleScopeHint = {
    student: 'فقط داده‌های خودتان — بدون فیلتر مدرسه/نفر دیگر',
    skill_learner: 'فقط داده‌های خودتان — بدون فیلتر مدرسه/نفر دیگر',
    mentor_teacher: 'محدوده: کارورزان تحت راهنمایی شما (مدرسه/معلم ثابت)',
    school_principal: 'محدوده: مدرسه شما (مدرسه در scope سرور ثابت است)',
    supervisor_professor: 'محدوده: کلاس‌ها و کارورزان تحت نظارت شما',
    regional_edu_admin: 'محدوده: منطقه/شهر تابعه — استان در scope است',
    edu_general_admin: 'محدوده: استان‌های تحت اداره کل',
    faculty_role: 'محدوده: دانشکده/پردیس شما',
    provincial_university: 'محدوده: استان دانشگاهی شما',
    central_organization: 'محدوده کلان کشوری — همه فیلترهای مجاز گزارش',
    assistant_admin: 'دسترسی پشتیبانی — همه فیلترهای مجاز گزارش',
    super_admin: 'دسترسی کامل — همه فیلترهای مجاز گزارش',
  };

  return {
    categories, catalog, mockUsers, roleNames,
    currentUserId: '#P1',
    currentRole: 'supervisor_professor',
    activeTab: 'standard_reports',
    isSidebarOpen: false,
    isSimulatorOpen: false,
    isFilterDrawerOpen: false,
    rbacOpen: false,
    librarySearch: '',
    moduleType: 'standard',
    selectedReportId: 'trainee_list',
    loading: false,
    toasts: [],
    chart: null,
    todayLabel: 'سه‌شنبه ۲۷ مهر ۱۴۰۵',
    comparePool: ['البرز', 'فجر', 'بهشتی', 'شرافت', 'کمال'],
    compareSelected: ['البرز', 'فجر', 'بهشتی'],
    provinces: ['تهران', 'اصفهان', 'فارس', 'خراسان رضوی'],
    rbacScope: 'تهران',
    rbacRole: 'faculty_role',
    rbacRoles: ['mentor_teacher', 'supervisor_professor', 'school_principal', 'regional_edu_admin', 'edu_general_admin', 'faculty_role', 'provincial_university', 'central_organization'],
    packages: { C1_trainee: true, C2_grades: true, C3_staff_schools: true, C4_governance: false },
    rolePerms: {},
    scopePerms: {},
    applied: {},
    draft: {},

    init() {
      this.applyWordDefaults(false);
      this.setupForRole();
    },

    toFa(n) {
      return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
    },
    roleName(r) { return roleNames[r] || r; },
    categoryLabel(id) { return (categories.find(c => c.id === id) || {}).label || id; },
    currentUser() { return mockUsers.find(u => u.id === this.currentUserId) || mockUsers[0]; },
    currentReport() { return catalog.find(r => r.id === this.selectedReportId); },
    reportLabel(r) {
      if (!r) return '';
      const labels = r.roleLabels || {};
      if (labels[this.currentRole]) return labels[this.currentRole];
      // مدیر ارشد / دستیار: نام کامل سند (ترجیح سازمان مرکزی، وگرنه کامل‌ترین برچسب نقش)
      if (['super_admin', 'assistant_admin'].includes(this.currentRole)) {
        return labels.central_organization
          || labels.faculty_role
          || labels.supervisor_professor
          || labels.edu_general_admin
          || labels.regional_edu_admin
          || labels.school_principal
          || labels.mentor_teacher
          || labels.student
          || Object.values(labels)[0]
          || r.title;
      }
      return r.title;
    },

    availableReports() {
      const ids = this.rolePerms[this.currentRole] || [];
      const byId = Object.fromEntries(catalog.map((r) => [r.id, r]));
      // ترتیب دقیقاً مطابق آرایهٔ نقش در سند مهر (نه ترتیب کاتالوگ)
      return ids
        .map((id) => byId[id])
        .filter(Boolean)
        .filter((r) => r.category !== 'C4_governance' || this.packages.C4_governance || ['super_admin', 'assistant_admin'].includes(this.currentRole));
    },
    libraryGroups() {
      const q = this.librarySearch.trim();
      const reps = this.availableReports().filter((r) => !q || (r.title + this.reportLabel(r)).includes(q));
      // یک گروه واحد «استاندارد» تا لیست مثل سند دیده شود
      if (!q) return [{ id: 'word_standard', label: 'استاندارد (سند مهر)', icon: 'fa-file-lines', reports: reps.filter((r) => r.category !== 'C4_governance') }]
        .concat(reps.some((r) => r.category === 'C4_governance')
          ? [{ id: 'C4_governance', label: 'حاکمیت (افزونه)', icon: 'fa-chart-pie', reports: reps.filter((r) => r.category === 'C4_governance') }]
          : [])
        .filter((g) => g.reports.length);
      return categories
        .map((c) => ({ id: c.id, label: c.label, icon: c.icon, reports: reps.filter((r) => r.category === c.id) }))
        .filter((g) => g.reports.length);
    },

    loginAs(mock) {
      this.currentUserId = mock.id;
      this.currentRole = mock.role;
      this.isSimulatorOpen = false;
      this.moduleType = 'standard';
      const admin = ['super_admin', 'assistant_admin', 'central_organization'].includes(mock.role);
      if (!admin || this.activeTab !== 'rbac') this.activeTab = 'standard_reports';
      this.setupForRole();
      this.toast('نقش فعال: ' + mock.roleLabel);
    },
    setupForRole() {
      const reps = this.availableReports();
      if (!reps.find(r => r.id === this.selectedReportId)) this.selectedReportId = reps[0]?.id || '';
      this.clearAllFilters(false);
      this.refresh();
    },
    selectReport(id) {
      this.selectedReportId = id;
      this.moduleType = 'standard';
      this.clearAllFilters(false);
      this.refresh();
    },
    onReportChange() { this.selectReport(this.selectedReportId); },
    setComparative() {
      const r = this.currentReport();
      if (!r?.comparable) { this.toast('این گزارش مقایسه‌ای ندارد'); return; }
      this.moduleType = 'comparative';
      this.$nextTick(() => this.renderChart());
    },

    /** کلیدهای فیلتر مجاز برای نقش × گزارش جاری */
    filterKeysForCurrent() {
      const r = this.currentReport();
      if (!r) return [];
      const role = this.currentRole;
      const override = reportRoleFilters[r.id] && reportRoleFilters[r.id][role];
      if (override) return override.slice();
      const allow = roleFilterAllow[role] || [];
      return (r.filters || []).filter((k) => allow.includes(k));
    },
    scopeHint() {
      return roleScopeHint[this.currentRole] || '';
    },
    visibleFilters() {
      return this.filterKeysForCurrent().map((k) => F[k]).filter(Boolean);
    },
    visibleColumns() {
      const r = this.currentReport();
      if (!r) return [];
      const keys = r.roleColumns && r.roleColumns[this.currentRole];
      if (!keys || !keys.length) return r.columns || [];
      const map = Object.fromEntries((r.columns || []).map((c) => [c.key, c]));
      return keys.map((k) => map[k]).filter(Boolean);
    },

    activeFilterCount() {
      const keys = new Set(this.filterKeysForCurrent());
      return Object.entries(this.applied).filter(([k, v]) => keys.has(k) && v !== '' && v != null).length;
    },
    activeChips() {
      const keys = new Set(this.filterKeysForCurrent());
      return Object.entries(this.applied)
        .filter(([k, v]) => keys.has(k) && v !== '' && v != null)
        .map(([k, v]) => ({ key: k, label: `${(F[k] || {}).label || k}: ${v}` }));
    },
    applyFilters() {
      const keys = this.filterKeysForCurrent();
      const next = {};
      keys.forEach((k) => { next[k] = this.draft[k] ?? ''; });
      this.applied = next;
      this.refresh();
    },
    resetDraft() {
      const d = {};
      this.filterKeysForCurrent().forEach((k) => { d[k] = ''; });
      this.draft = d;
    },
    clearFilter(key) { this.applied[key] = ''; this.draft[key] = ''; this.refresh(); },
    clearAllFilters(doRefresh = true) {
      const d = {};
      this.filterKeysForCurrent().forEach((k) => { d[k] = ''; });
      this.applied = { ...d };
      this.draft = { ...d };
      if (doRefresh) this.refresh();
    },
    openFilters() {
      const d = {};
      this.filterKeysForCurrent().forEach((k) => { d[k] = this.applied[k] ?? ''; });
      this.draft = d;
      this.isFilterDrawerOpen = true;
    },

    tableRows() {
      const r = this.currentReport();
      if (!r) return [];
      let rows = r.rows || [];
      const school = this.applied.schoolId;
      const province = this.applied.provinceId;
      const trainee = this.applied.traineeId;
      if (school) rows = rows.filter(row => Object.values(row).some(v => String(v).includes(school)));
      if (province) rows = rows.filter(row => Object.values(row).some(v => String(v).includes(province)));
      if (trainee) rows = rows.filter(row => Object.values(row).some(v => String(v).includes(trainee)));
      return rows;
    },
    refresh() {
      this.loading = true;
      setTimeout(() => { this.loading = false; }, 180);
    },

    toggleCompare(e) {
      if (this.compareSelected.includes(e)) {
        if (this.compareSelected.length <= 2) return;
        this.compareSelected = this.compareSelected.filter(x => x !== e);
      } else {
        if (this.compareSelected.length >= 5) { this.toast('حداکثر ۵ مورد'); return; }
        this.compareSelected.push(e);
      }
      this.renderChart();
    },
    renderChart() {
      const canvas = document.getElementById('cmpChart');
      if (!canvas || !window.Chart) return;
      const labels = this.compareSelected;
      if (this.chart) this.chart.destroy();
      this.chart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'متریک ۱', data: labels.map((_, i) => 12 + (i * 5) % 11), backgroundColor: 'rgba(12,70,177,.85)', borderRadius: 8 },
            { label: 'متریک ۲', data: labels.map((_, i) => 40 + (i * 9) % 30), backgroundColor: 'rgba(15,23,42,.45)', borderRadius: 8 },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { font: { family: 'Vazirmatn' } } },
            title: { display: true, text: this.reportLabel(this.currentReport()), font: { family: 'Vazirmatn', weight: '700' } },
          },
          scales: {
            x: { ticks: { font: { family: 'Vazirmatn' } }, grid: { display: false } },
            y: { beginAtZero: true, ticks: { font: { family: 'Vazirmatn' } } },
          },
        },
      });
    },

    applyWordDefaults(show = true) {
      this.rolePerms = JSON.parse(JSON.stringify(wordDefaults));
      if (!this.scopePerms[this.rbacScope]) this.scopePerms[this.rbacScope] = JSON.parse(JSON.stringify(wordDefaults));
      if (show) this.toast('پیش‌فرض سند برای نقش‌ها اعمال شد');
    },
    isAllowed(role, id) { return (this.rolePerms[role] || []).includes(id); },
    togglePerm(role, id) {
      const set = new Set(this.rolePerms[role] || []);
      if (set.has(id)) set.delete(id); else set.add(id);
      this.rolePerms[role] = [...set];
      if (role === this.currentRole) this.setupForRole();
    },
    togglePackage(catId) {
      this.packages[catId] = !this.packages[catId];
      if (this.packages[catId]) {
        (wordDefaults[this.rbacRole] || []).forEach(id => {
          const r = catalog.find(x => x.id === id);
          if (r && r.category === catId) {
            const set = new Set(this.rolePerms[this.rbacRole] || []);
            set.add(id);
            this.rolePerms[this.rbacRole] = [...set];
          }
        });
        this.toast(`بسته ${this.categoryLabel(catId)} برای ${this.rbacScope} فعال شد`);
      }
    },
    copyScopeFrom(src) {
      const data = this.scopePerms[src] || wordDefaults;
      this.rolePerms = JSON.parse(JSON.stringify(data));
      this.scopePerms[this.rbacScope] = JSON.parse(JSON.stringify(data));
      this.toast(`دسترسی‌ها از ${src} به ${this.rbacScope} کپی شد`);
    },

    canRbac() {
      return ['super_admin', 'assistant_admin', 'central_organization'].includes(this.currentRole);
    },

    toast(message) {
      const id = Date.now();
      this.toasts.push({ id, message });
      setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); }, 2400);
    },
  };
}
