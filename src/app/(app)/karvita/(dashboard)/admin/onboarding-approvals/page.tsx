import { OnboardingApprovalsPage } from '@/features/karvita/onboarding-approvals/components/OnboardingApprovalsPage';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('onboarding-approvals');

export default function OnboardingApprovalsRoutePage() {
  return <OnboardingApprovalsPage />;
}
