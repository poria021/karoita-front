import { useUserStore } from '@/store/useUserStore';
import type { DocStatus, User, UserRole } from '@/types/auth';

/**
 * Facade for user-profile mutations (rule 40).
 *
 * UI / hooks must call `UserService` instead of mutating Zustand or hitting
 * NestJS directly. Toggle mock vs real with `NEXT_PUBLIC_API_MODE`.
 */

const IS_MOCK_MODE = process.env.NEXT_PUBLIC_API_MODE !== 'real';

/** Flat profile payload accepted by the service (mirrors NestJS DTO). */
export interface UpdateProfilePayload {
  role: UserRole;
  firstName: string;
  lastName: string;
  /** Optional for `super_admin` / `central_organization` / `assistant_admin`. */
  province?: string;
  college?: string;
  major?: string;
  studentId?: string;
  skillCode?: string;
  personalCode?: string;
  district?: string;
  school?: string;
  city?: string;
  identityDoc?: File | null;
}

function mergeProfileIntoUser(activeUser: User, data: UpdateProfilePayload): User {
  return {
    ...activeUser,
    firstName: data.firstName,
    lastName: data.lastName,
    province: data.province ?? activeUser.province,
    college: data.college ?? activeUser.college,
    major: data.major ?? activeUser.major,
    studentId: data.studentId ?? activeUser.studentId,
    skillCode: data.skillCode ?? activeUser.skillCode,
    personalCode: data.personalCode ?? activeUser.personalCode,
    district: data.district ?? activeUser.district,
    school: data.school ?? activeUser.school,
    // Identity submitted — awaiting admin review.
    approved: false,
    docStatus: 'pending_admin' as DocStatus,
  };
}

export const UserService = {
  /**
   * Persists profile onboarding fields. In mock mode this updates the local
   * Zustand session; in real mode it will POST to NestJS once wired.
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const { identityDoc: _identityDoc, ...data } = payload;
    void _identityDoc;

    const activeUser = useUserStore.getState().activeUser;
    if (!activeUser) {
      throw new Error('نشست کاربری یافت نشد. لطفاً دوباره وارد شوید.');
    }

    if (IS_MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const updatedUser = mergeProfileIntoUser(activeUser, data);
      useUserStore.getState().setUser(updatedUser);
      return updatedUser;
    }

    throw new Error(
      'اتصال به API واقعی هنوز پیکربندی نشده است. NEXT_PUBLIC_API_MODE را روی mock بگذارید.'
    );
  },
};
