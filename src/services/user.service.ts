/**
 * Thin compatibility shim — profile mutations live on ProfileService (rule 40).
 * Prefer importing `ProfileService` directly from `@/services/profile.service`.
 */
export {
  ProfileService,
  type UpdateOnboardingProfilePayload as UpdateProfilePayload,
} from '@/services/profile.service';

import { ProfileService } from '@/services/profile.service';
import type { UpdateOnboardingProfilePayload } from '@/services/profile.service';
import type { User } from '@/types/auth';

/** @deprecated Use `ProfileService.updateOnboardingProfile`. */
export const UserService = {
  updateProfile(
    payload: UpdateOnboardingProfilePayload
  ): Promise<User> {
    return ProfileService.updateOnboardingProfile(payload);
  },
};
