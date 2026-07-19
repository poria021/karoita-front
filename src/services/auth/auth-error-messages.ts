/**
 * Auth error copy shared by mock ops (and eventually Nest error mapping).
 * Keep messages stable — UI surfaces them via field errors (rule 45).
 */

/** Unknown mobile on public / recovery paths. */
export const AUTH_ERR_USER_NOT_FOUND = 'کاربری با این شماره یافت نشد.';

/**
 * Public login/forgot must not serve senior-admin accounts.
 * Same copy as {@link AUTH_ERR_USER_NOT_FOUND} so the role is not enumerable.
 */
export const AUTH_ERR_PUBLIC_AUTH_ADMIN_BLOCKED = AUTH_ERR_USER_NOT_FOUND;

/** Admin gate only. */
export const AUTH_ERR_ADMIN_GATE_ONLY =
  'دسترسی این درگاه فقط برای مدیریت ارشد سامانه است.';
