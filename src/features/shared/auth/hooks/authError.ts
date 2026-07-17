/**
 * Extracts a user-facing message from an unknown thrown value, falling back to
 * a localized default. Shared by the auth flow hooks so error handling stays
 * identical across password / OTP / password-recovery submissions.
 */
export function readAuthErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
