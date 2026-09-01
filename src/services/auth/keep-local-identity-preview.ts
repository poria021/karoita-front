import type { User } from '@/types/auth';

function isDataImageUrl(value: string | undefined): boolean {
  return typeof value === 'string' && value.startsWith('data:image/');
}

/**
 * `PATCH /auth/me` ممکن است فیلد سازمان را حذف کند؛ جایگزینی کامل سشن استان/شهر را تا GET بعدی پاک می‌کند.
 * آرایهٔ خالی از سرور می‌ماند؛ فقط `undefined` از سشن قبلی پر می‌شود.
 */
export function retainSessionOrgFields(
  previous: User | null | undefined,
  incoming: User
): User {
  if (!previous || previous.id !== incoming.id) return incoming;
  return {
    ...incoming,
    province: incoming.province ?? previous.province,
    city: incoming.city ?? previous.city,
    college: incoming.college ?? previous.college,
    district: incoming.district ?? previous.district,
    school: incoming.school ?? previous.school,
    major: incoming.major ?? previous.major,
    studentId: incoming.studentId ?? previous.studentId,
    skillCode: incoming.skillCode ?? previous.skillCode,
    personalCode: incoming.personalCode ?? previous.personalCode,
  };
}

/** GET هویت از S3 اغلب خصوصی است؛ refresh نباید data-URL پیش‌نمایش را با کلید غیرقابل‌نمایش عوض کند. */
export function keepLocalIdentityPreview(
  previous: User | null | undefined,
  incoming: User
): User {
  const prev = previous?.docUrl;
  if (
    previous?.id === incoming.id &&
    isDataImageUrl(prev) &&
    !isDataImageUrl(incoming.docUrl)
  ) {
    return { ...incoming, docUrl: prev };
  }
  return incoming;
}
