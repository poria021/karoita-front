import type { User } from '@/types/auth';

function isDataImageUrl(value: string | undefined): boolean {
  return typeof value === 'string' && value.startsWith('data:image/');
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
