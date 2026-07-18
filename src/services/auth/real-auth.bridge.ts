import { authClient } from '@/lib/auth-client';
import type { User, UserRole } from '@/types/auth';

import {
  buildMockSession,
  dispatchSessionToStore,
  MOCK_SESSION_TTL_MS,
} from '@/services/auth/mock-auth.store';

const INTERIM_BRIDGE_PASSWORD = 'karvita-otp-bridge-placeholder';

function toPseudoEmail(mobile: string): string {
  return `${mobile}@karvita.local`;
}

function mapBetterAuthRole(rawRole: string | null | undefined): UserRole {
  return rawRole === 'admin' ? 'super_admin' : 'student';
}

/** Better-Auth credential sign-in (migration bridge — not Nest). */
export async function realLoginWithCredentials(
  mobile: string,
  password: string
): Promise<User> {
  const { data, error } = await authClient.signIn.email({
    email: toPseudoEmail(mobile),
    password,
  });

  if (error || !data?.user) {
    throw new Error(error?.message || 'ورود ناموفق بود.');
  }

  const user: User = {
    id: data.user.id,
    firstName: data.user.name?.split(' ')[0] ?? '',
    lastName: data.user.name?.split(' ').slice(1).join(' ') ?? '',
    mobile,
    role: mapBetterAuthRole((data.user as { role?: string | null }).role),
    approved: false,
    docStatus: 'not_submitted',
  };

  dispatchSessionToStore({
    user,
    token: '',
    expiresAt: new Date(Date.now() + MOCK_SESSION_TTL_MS).toISOString(),
  });
  return user;
}

export async function realRegister(mobile: string): Promise<void> {
  const { error } = await authClient.signUp.email({
    email: toPseudoEmail(mobile),
    password: INTERIM_BRIDGE_PASSWORD,
    name: 'کاربر جدید',
  });

  if (error) {
    throw new Error(error.message || 'ثبت‌نام ناموفق بود.');
  }
}

export async function realSignOut(): Promise<void> {
  try {
    await authClient.signOut();
  } catch {
    // Caller still clears local session.
  }
}

export { buildMockSession, MOCK_SESSION_TTL_MS };
