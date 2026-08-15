/** Map unknown throw values to a user-facing Persian/English message. */
export function unknownErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
