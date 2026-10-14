/**
 * دادهٔ نمایشی ثبت‌نام: مدرسه، دانشجو، معلم راهنما و مدیر مدرسه، سه ثبت‌نام در
 * درس اول ترم ترمی، و هفته‌هایی در وضعیت‌های مختلف تا کارت‌های رنگی صفحه‌ی ارزیابی
 * و گزارش هفتگی همه دیده شوند:
 *  - دانشجوی ۱: هفته ۱ نمره‌گرفته، هفته ۲ ارسال‌شده (در انتظار بررسی)
 *  - دانشجوی ۲: هفته ۱ ارسال و توسط استاد برگشت‌خورده (نیازمند اصلاح)
 *  - دانشجوی ۳: هیچ اقدامی
 */
import {
  appendMessage,
  createEnrollmentRecords,
  studentWeeksOf,
  weightedScoreOf,
} from './domain';
import { addSeedFile, SEED_PASSWORD, seedRoleId } from './seed';
import { newId, nowIso, type Store, type StoredUser } from './store';

const WEEK_COUNT = 4;
const WEEK_PRIORITY = 3;

function addUser(
  store: Store,
  input: Pick<StoredUser, 'firstName' | 'lastName' | 'phone' | 'roleName' | 'schoolId'>
): StoredUser {
  const user: StoredUser = {
    id: newId(),
    password: SEED_PASSWORD,
    roleId: seedRoleId(input.roleName),
    ...input,
  };
  store.users.set(user.id, user);
  return user;
}

export function seedEnrollmentModule(store: Store): void {
  const mentor = [...store.users.values()].find((user) => user.roleName === 'mentor');
  const semester = [...store.semesters.values()].find((row) => row.structure === 'semester');
  const lesson = semester
    ? [...store.lessons.values()].find((row) => row.semesterId === semester.id)
    : undefined;
  // ترمی که هیچ درسی ندارد (حالت `original` بدون تعریف دروس) ثبت‌نامی هم ندارد.
  if (!mentor || !semester || !lesson) return;

  const school = { id: newId(), title: 'هنرستان فنی شهید بهشتی' };
  const otherSchool = { id: newId(), title: 'دبیرستان نمونه' };
  store.schools.set(school.id, school);
  store.schools.set(otherSchool.id, otherSchool);

  const teacher = addUser(store, {
    firstName: 'سارا',
    lastName: 'موسوی',
    phone: '09123456791',
    roleName: 'teacher',
    schoolId: school.id,
  });
  addUser(store, {
    firstName: 'عباس',
    lastName: 'پناهی',
    phone: '09123456792',
    roleName: 'school_admin',
    schoolId: school.id,
  });
  const students = [
    ['نگار', 'محمدی', '09123456781'],
    ['علی', 'رضایی', '09123456782'],
    ['پارسا', 'توکلی', '09123456783'],
  ].map(([firstName, lastName, phone]) =>
    addUser(store, {
      firstName: firstName!,
      lastName: lastName!,
      phone: phone!,
      roleName: 'student',
    })
  );

  // درس اول ارائه می‌شود و سرفصل دارد (بدون سرفصل هفته‌ای نیست که گزارش بخورد).
  lesson.status = true;
  for (let i = 0; i < WEEK_COUNT; i += 1) {
    const id = newId();
    store.weeks.set(id, {
      id,
      lessonId: lesson.id,
      priority: WEEK_PRIORITY,
      status: true,
      createdAt: nowIso(),
    });
  }
  const capacityId = newId();
  store.professorCapacities.set(capacityId, {
    id: capacityId,
    professorId: mentor.id,
    lessonId: lesson.id,
    semesterId: semester.id,
    capacity: 10,
    days: [0, 2],
  });

  const [first, second] = students.map((student, index) =>
    createEnrollmentRecords(store, {
      studentId: student.id,
      semesterId: semester.id,
      lessonId: lesson.id,
      professorId: mentor.id,
      schoolId: index < 2 ? school.id : null,
      teacherId: index < 2 ? teacher.id : null,
    })
  );

  const conversationOf = (enrollmentId: string, weekIndex: number) => {
    const week = studentWeeksOf(store, enrollmentId)[weekIndex]!;
    const conversation = [...store.conversations.values()].find(
      (row) => row.enrollmentId === enrollmentId && row.weekId === week.weekId
    )!;
    return { week, conversation };
  };

  const report = addSeedFile(store, 'گزارش هفته اول', 215, mentor.id);

  // دانشجوی ۱: هفته ۱ نمره‌گرفته.
  {
    const { week, conversation } = conversationOf(first!.id, 0);
    appendMessage(store, conversation, students[0]!, {
      text: 'گزارش هفته اول: مشاهده کلاس و تحلیل روش تدریس.',
      fileIds: [report.id],
    });
    const now = nowIso();
    week.status = 'completed';
    week.score = 90;
    week.weightedScore = weightedScoreOf(store, week, 90);
    week.scoreGivenBy = mentor.id;
    week.scoreGivenAt = now;
    week.completedAt = now;
    week.mentorStatus = 'score';
    week.schoolVisited = true;
    week.isMentorPresent = true;
  }
  // دانشجوی ۱: هفته ۲ ارسال‌شده و در انتظار بررسی.
  appendMessage(store, conversationOf(first!.id, 1).conversation, students[0]!, {
    text: 'گزارش هفته دوم: اجرای فعالیت گروهی با دانش‌آموزان.',
  });
  // دانشجوی ۲: هفته ۱ ارسال و برگشت‌خورده.
  {
    const { conversation } = conversationOf(second!.id, 0);
    appendMessage(store, conversation, students[1]!, { text: 'گزارش هفته اول.' });
    appendMessage(store, conversation, mentor, {
      text: 'بخش تحلیل کامل نیست؛ لطفاً اصلاح و دوباره ارسال کنید.',
    });
  }

  // فایل درس: استاد یک جزوه برای درس اول گذاشته.
  const notes = addSeedFile(store, 'جزوه جلسه اول', 160, mentor.id);
  const id = newId();
  const now = nowIso();
  store.mentorLessonFiles.set(id, {
    id,
    professorId: mentor.id,
    lessonId: lesson.id,
    description: 'خلاصه‌ی مباحث جلسه اول',
    fileIds: [notes.id],
    createdAt: now,
    updatedAt: now,
  });

  // ترم باز برای انتخاب واحد و کلاس‌ها (برای دیدن صفحه‌ی ثبت‌نام دانشجو).
  semester.courseSelection = true;
  semester.startClasses = true;
}
