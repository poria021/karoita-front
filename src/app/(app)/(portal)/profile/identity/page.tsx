import { LegacyProfileRedirect } from '../LegacyProfileRedirect';

/**
 * Legacy `/profile/identity` bookmark — forwards to the role-scoped Karvita profile.
 * RSC shell; redirect logic lives in the client leaf (no nested HydrationSafe).
 */
export default function LegacyProfileIdentityPage() {
  return <LegacyProfileRedirect target="identity" />;
}
