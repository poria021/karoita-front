/**
 * Canonical Facade lives in `src/services/profile.service.ts`.
 * Re-export kept so existing feature imports stay stable (rule 40).
 */
export {
  ProfileService,
  type UpdateOnboardingProfilePayload,
} from '@/services/profile.service';
