import type { User } from '@/types/auth';

function isDataImageUrl(value: string | undefined): boolean {
  return typeof value === 'string' && value.startsWith('data:image/');
}

/**
 * PATCH /auth/me may omit org/identifier fields. Replacing the session user
 * wholesale would wipe province/city/… until the next full GET /auth/me.
 * Empty arrays from the server still win; only `undefined` is filled from
 * the previous session.
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

/**
 * Nest/S3 GET for identity docs is often private. After the user uploads,
 * we keep a data-URL preview on the client user. Session refresh from
 * `/auth/me` must not replace that with a storage key that cannot render.
 */
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
