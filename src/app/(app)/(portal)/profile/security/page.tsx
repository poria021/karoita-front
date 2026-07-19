import { LegacyProfileRedirect } from '../LegacyProfileRedirect';

/**
 * Legacy `/profile/security` bookmark — forwards to role profile security tab.
 * RSC shell; redirect logic lives in the client leaf (no nested HydrationSafe).
 */
export default function LegacyProfileSecurityPage() {
  return <LegacyProfileRedirect target="security" />;
}
