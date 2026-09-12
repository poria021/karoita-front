import { apiClient, ApiClientError } from '@/services/api-client';
import { mapNestAuthUser } from '@/services/auth/real/nest-auth-mappers';
import { clearRealAuthTokens } from '@/services/auth/real/real-auth.tokens';
import { useUserStore } from '@/store/useUserStore';
import type { User } from '@/types/auth';
import type { NestAuthUpdateDto } from '@/types/nest-users';

import { realFetchSession } from './session';
import { currentSurface, guard, REAL_AUTH_PATHS } from './shared';

export async function realUpdateMe(
  body: NestAuthUpdateDto,
  token?: string
): Promise<User> {
  guard('real-auth.bridge.updateMe');
  const fallbackMobile = useUserStore.getState().activeUser?.mobile;
  const raw = await apiClient.patchMaybeJson<unknown>(
    REAL_AUTH_PATHS.updateMe,
    body,
    token
  );
  if (raw) return mapNestAuthUser(raw, fallbackMobile);

  const session = await realFetchSession(fallbackMobile, token);
  if (session) return session.user;

  throw new ApiClientError(
    'به‌روزرسانی حساب انجام شد اما پاسخ کاربر از سرور دریافت نشد.'
  );
}

export async function realDeleteMe(token?: string): Promise<void> {
  guard('real-auth.bridge.deleteMe');
  await apiClient.deleteMaybeJson(REAL_AUTH_PATHS.deleteMe, token);
  clearRealAuthTokens();
}

export async function realSignOut(): Promise<void> {
  guard('real-auth.bridge.logout');
  const surface = currentSurface();
  try {
    // لایو ۲۰۴ بدون بدنه می‌دهد؛ `postJson` روی `.json()` پاسخ خالی می‌ترکد — از `postMaybeJson` استفاده کن.
    if (surface === 'admin') {
      await apiClient.postMaybeJson(REAL_AUTH_PATHS.adminLogout, {});
    } else if (surface === 'user') {
      await apiClient.postMaybeJson(REAL_AUTH_PATHS.logout, {});
    }
  } finally {
    clearRealAuthTokens();
  }
}
